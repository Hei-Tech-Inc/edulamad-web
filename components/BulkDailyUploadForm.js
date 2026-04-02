// components/BulkDailyUploadForm.js — bulk POST /units/:unitId/daily-records/bulk (Nsuo)
import React, { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { CloudUpload, Info } from 'lucide-react'
import BulkUploadModal from './BulkUploadModal'
import { useToast } from './Toast'
import { apiClient } from '@/api/client'
import API from '@/api/endpoints'
import { queryKeys } from '@/api/query-keys'
import { resolveFarmIdForRedux } from '@/lib/resolve-farm-for-redux'
import { fetchLegacyUnitsForFarm } from '@/lib/cages-redux-api'
import { fetchActiveCycleIdForUnit } from '@/lib/unit-cycles-api'

// Excel serial number to YYYY-MM-DD string
const excelSerialDateToJSDate = (serial) => {
  const utc_days = Math.floor(serial - 25569)
  const utc_value = utc_days * 86400
  const date_info = new Date(utc_value * 1000)

  const fractional_day = serial - Math.floor(serial) + 0.0000001
  const total_seconds = Math.floor(86400 * fractional_day)

  const seconds = total_seconds % 60
  const minutes = Math.floor(total_seconds / 60) % 60
  const hours = Math.floor(total_seconds / 3600)

  date_info.setHours(hours)
  date_info.setMinutes(minutes)
  date_info.setSeconds(seconds)

  return date_info.toISOString().split('T')[0]
}

function chunkArray(arr, size) {
  const out = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

function parseRowDate(row, rowIndex) {
  if (row.date instanceof Date) {
    return row.date.toISOString().split('T')[0]
  }
  if (!isNaN(row.date) && row.date !== '') {
    return excelSerialDateToJSDate(parseFloat(row.date))
  }
  try {
    const parts = String(row.date).split(/[-/]/)
    if (parts.length === 3) {
      const [day, month, year] = parts
      return new Date(year, month - 1, day).toISOString().split('T')[0]
    }
    return new Date(row.date).toISOString().split('T')[0]
  } catch {
    throw new Error(
      `Row ${rowIndex + 2}: Invalid date format: "${row.date}". Use YYYY-MM-DD or DD/MM/YYYY.`,
    )
  }
}

const BulkDailyUploadForm = () => {
  const queryClient = useQueryClient()
  const [cages, setCages] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const { showToast } = useToast()

  // Updated template headers to include cage_code as the primary identifier
  const templateHeaders = [
    'cage_code', // Primary identifier (REQUIRED)
    'cage_name', // For user reference only (OPTIONAL)
    'date',
    'feed_amount',
    'feed_type',
    'feed_price',
    'mortality',
    'notes',
  ]

  // Updated validation rules
  const validationRules = {
    cage_code: { required: true }, // Making cage_code required
    cage_name: { required: false }, // Making cage_name optional
    date: { required: true, type: 'date' },
    feed_amount: { required: true, type: 'number', min: 0 },
    feed_type: { required: true },
    feed_price: { required: false, type: 'number', min: 0 },
    mortality: { required: false, type: 'number', min: 0 },
    notes: { required: false },
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const farmId = await resolveFarmIdForRedux()
        if (!farmId) {
          setCages([])
          return
        }
        const { legacy } = await fetchLegacyUnitsForFarm(farmId, { limit: 500 })
        const withCode = legacy
          .map((u) => ({ ...u, code: u.name }))
          .sort((a, b) => a.name.localeCompare(b.name))
        setCages(withCode)
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to load required data. Please try again.')
        showToast('Failed to load units', 'error')
        setCages([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only farm load
  }, [])

  const handleUpload = async (parsedData) => {
    try {
      const staged = []

      for (let rowIndex = 0; rowIndex < parsedData.length; rowIndex++) {
        const row = { ...parsedData[rowIndex] }
        Object.keys(row).forEach((key) => {
          if (typeof row[key] === 'string') row[key] = row[key].trim()
        })

        const codeKey = row.cage_code?.toLowerCase().trim()
        const cage = cages.find(
          (c) =>
            c.code?.toLowerCase() === codeKey ||
            c.id === row.cage_code?.trim(),
        )

        if (!cage) {
          throw new Error(
            `Row ${rowIndex + 2}: No unit matches cage_code "${row.cage_code}". Use the exact unit name (or unit UUID).`,
          )
        }

        const feedAmount = parseFloat(row.feed_amount)
        if (isNaN(feedAmount) || feedAmount <= 0) {
          throw new Error(
            `Row ${rowIndex + 2}: Invalid feed amount "${row.feed_amount}".`,
          )
        }

        const feedPrice = row.feed_price
          ? parseFloat(row.feed_price)
          : 1.5
        if (isNaN(feedPrice) || feedPrice < 0) {
          throw new Error(
            `Row ${rowIndex + 2}: Invalid feed price "${row.feed_price}".`,
          )
        }

        const feedCost = feedAmount * feedPrice
        const mortality = row.mortality ? parseInt(row.mortality, 10) : 0
        if (isNaN(mortality) || mortality < 0) {
          throw new Error(
            `Row ${rowIndex + 2}: Invalid mortality "${row.mortality}".`,
          )
        }

        const parsedDate = parseRowDate(row, rowIndex)
        const feedTypeStr = row.feed_type?.trim()
        if (!feedTypeStr) {
          throw new Error(`Row ${rowIndex + 2}: feed_type is required.`)
        }

        staged.push({
          unitId: cage.id,
          payload: {
            date: parsedDate,
            feedType: feedTypeStr,
            feedQuantityKg: feedAmount,
            feedCostGhs: feedCost,
            mortalityCount: mortality,
            notes: row.notes || undefined,
            source: 'bulk_csv',
          },
        })
      }

      const unitIds = [...new Set(staged.map((s) => s.unitId))]
      const cycleMap = new Map()
      await Promise.all(
        unitIds.map(async (uid) => {
          const cid = await fetchActiveCycleIdForUnit(uid)
          cycleMap.set(uid, cid)
        }),
      )

      for (const s of staged) {
        const cycleId = cycleMap.get(s.unitId)
        if (!cycleId) {
          const label =
            cages.find((c) => c.id === s.unitId)?.name ?? s.unitId
          throw new Error(
            `No active stock cycle for unit "${label}". Start a cycle in Nsuo before bulk upload.`,
          )
        }
        s.payload.cycleId = cycleId
      }

      const byUnit = new Map()
      for (const s of staged) {
        if (!byUnit.has(s.unitId)) byUnit.set(s.unitId, [])
        byUnit.get(s.unitId).push(s.payload)
      }

      let total = 0
      for (const [unitId, records] of byUnit) {
        for (const chunk of chunkArray(records, 500)) {
          await apiClient.post(API.units.dailyRecordsBulk(unitId), {
            records: chunk,
          })
          total += chunk.length
        }
        queryClient.invalidateQueries({
          queryKey: queryKeys.dailyRecords.byUnit(unitId),
        })
      }

      setMessage(`Successfully uploaded ${total} records`)
      showToast(`Successfully uploaded ${total} records`, 'success')
      return { success: true }
    } catch (error) {
      console.error('Error processing upload:', error)
      showToast(error.message || 'Upload failed', 'error')
      throw error
    }
  }

  // Function to generate template with valid examples
  const generateTemplateData = () => {
    const headers = templateHeaders
    const exampleData = []
    const eligible = cages.filter(
      (c) => c.status === 'active' || c.status === 'ready_to_harvest',
    )
    if (eligible.length > 0) {
      exampleData.push([
        eligible[0].code,
        eligible[0].name,
        new Date().toISOString().split('T')[0],
        '1.5',
        'floating pellet 2mm',
        '1.50',
        '0',
        'Sample record',
      ])
    }

    return { headers, exampleData }
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="font-medium text-gray-700">Bulk Daily Records Upload</h2>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-6 bg-red-50 text-red-800 p-4 rounded-md">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 bg-green-50 text-green-800 p-4 rounded-md">
            {message}
          </div>
        )}

        <div className="text-gray-600 mb-6">
          <p>
            Upload multiple daily records at once using an Excel or CSV file.
            The file should follow the template format with the following
            columns:
          </p>
          <div className="mt-4 bg-blue-50 p-4 rounded-md">
            <h3 className="text-blue-800 font-medium flex items-center">
              <Info className="h-5 w-5 mr-2" /> Required Columns
            </h3>
            <ul className="mt-2 list-disc list-inside text-blue-800">
              <li>
                <strong>cage_code</strong>:{' '}
                <span className="text-red-600">Must match</span> a unit name (or
                unit UUID) for your farm — same value as in the list below
              </li>
              <li>
                <strong>date</strong>: Date of the record (YYYY-MM-DD format)
              </li>
              <li>
                <strong>feed_amount</strong>: Amount of feed in kg
              </li>
              <li>
                <strong>feed_type</strong>: Free-text label stored on the daily
                record (e.g. pellet size), same as manual daily entry
              </li>
            </ul>
            <h3 className="mt-4 text-blue-800 font-medium">Optional Columns</h3>
            <ul className="mt-2 list-disc list-inside text-blue-800">
              <li>
                <strong>cage_name</strong>: For reference only (the cage_code
                will be used to find the cage)
              </li>
              <li>
                <strong>feed_price</strong>: Price per kg in GHS (defaults to
                1.50 if omitted)
              </li>
              <li>
                <strong>mortality</strong>: Number of mortalities (defaults to
                0)
              </li>
              <li>
                <strong>notes</strong>: Any additional notes
              </li>
            </ul>
          </div>

          <div className="mt-4 bg-gray-50 p-4 rounded-md">
            <h3 className="text-gray-700 font-medium">
              Units (use name as cage_code):
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {cages
                .filter(
                  (c) =>
                    c.status === 'active' || c.status === 'ready_to_harvest',
                )
                .map((cage) => (
                  <span
                    key={cage.id}
                    className="bg-gray-200 px-2 py-1 rounded text-sm text-gray-700"
                  >
                    {cage.name}
                  </span>
                ))}
              {cages.filter(
                (c) =>
                  c.status === 'active' || c.status === 'ready_to_harvest',
              ).length === 0 && (
                <span className="text-gray-500 text-sm">No eligible units</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            disabled={loading}
            className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
              loading
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
          >
            <CloudUpload className="h-5 w-5 mr-2" />
            Upload Daily Records
          </button>
        </div>

        {/* Pass the template generation function to BulkUploadModal */}
        <BulkUploadModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onUpload={handleUpload}
          recordType="daily_records"
          templateHeaders={templateHeaders}
          validationRules={validationRules}
          maxRows={500}
          templateData={generateTemplateData()}
          cages={cages}
          feedTypes={[]}
        />
      </div>
    </div>
  )
}

export default BulkDailyUploadForm
