// pages/company-settings.js
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  Save,
  Upload,
  Trash,
  Building,
  User,
  Mail,
  Phone,
} from 'lucide-react'
import ProtectedRoute from '../components/ProtectedRoute'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import organizationService from '../lib/organizationService'
import { useToast } from '../components/Toast'
import { AppApiError } from '@/lib/api-error'

export default function OrganizationSettingsPage() {
  return (
    <ProtectedRoute>
      <Layout title="Institution settings">
        <OrganizationSettings />
      </Layout>
    </ProtectedRoute>
  )
}

function OrganizationSettings() {
  const router = useRouter()
  const { user } = useAuth()
  const { showToast } = useToast()
  const fileInputRef = useRef(null)

  const [organization, setOrganization] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [readOnlyNotice, setReadOnlyNotice] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    abbreviation: '',
    address: '',
    contact_email: '',
    contact_phone: '',
  })

  const fetchOrganizationData = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await organizationService.getOrganizationDetails()

      if (error && !data) throw error

      console.log('Fetched organization data:', data)
      setOrganization(data || { id: 'local-org', name: '', logo_url: null, settings: {} })
      setFormData({
        name: data?.name || '',
        abbreviation: data?.abbreviation || '',
        address: data?.address || '',
        contact_email: data?.contact_email || '',
        contact_phone: data?.contact_phone || '',
      })
      if (error instanceof AppApiError) {
        setReadOnlyNotice(error.message)
      }
    } catch (error) {
      console.error('Error fetching organization data:', error.message)
      setError('Failed to load institution data. Please try again.')
      showToast('Failed to load institution data', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    void fetchOrganizationData()
  }, [fetchOrganizationData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      // Validate form
      if (!formData.name) {
        throw new Error('Institution name is required')
      }

      const { data, error } = await organizationService.updateOrganization(organization.id, {
        ...formData,
        logo_url: organization.logo_url,
        settings: organization.settings,
      })

      if (error instanceof AppApiError) {
        setReadOnlyNotice(error.message)
      }
      if (data) {
        setOrganization(data)
      }

      if (!error) {
        showToast('Institution settings updated successfully', 'success')
      } else {
        showToast(error.message, 'error')
      }
    } catch (error) {
      console.error('Error updating organization:', error.message)
      setError(error.message)
      showToast(error.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoClick = () => {
    // Trigger file input click
    fileInputRef.current.click()
  }

  const handleLogoChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml']
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, GIF, SVG)')
      showToast('Invalid file type', 'error')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image size should be less than 2MB')
      showToast('File too large', 'error')
      return
    }

    setUploading(true)
    setError('')

    try {
      const { data, error } = await organizationService.uploadLogo(organization.id, file)

      if (error) throw error

      showToast('Logo uploaded successfully', 'success')
      setOrganization(data)
    } catch (error) {
      console.error('Error uploading logo:', error.message)
      setError('Failed to upload logo: ' + error.message)
      showToast('Failed to upload logo', 'error')
    } finally {
      setUploading(false)
      // Reset file input
      e.target.value = null
    }
  }

  const handleDeleteLogo = async () => {
    if (!organization.logo_url) return

    if (!confirm('Are you sure you want to delete the institution logo?')) {
      return
    }

    setUploading(true)
    setError('')

    try {
      const { data, error } = await organizationService.deleteLogo(
        organization.id,
        organization.logo_url,
      )

      if (error) throw error

      showToast('Logo removed successfully', 'success')
      setOrganization(data)
    } catch (error) {
      console.error('Error deleting logo:', error.message)
      setError('Failed to delete logo: ' + error.message)
      showToast('Failed to delete logo', 'error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] dark:border-neutral-800 dark:bg-neutral-950/80">
        <Link
          href="/dashboard"
          className="mr-4 inline-flex items-center text-sm font-medium text-orange-600 transition hover:text-orange-700"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50">Institution settings</h1>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)] dark:border-neutral-800 dark:bg-neutral-950/80">
          {loading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600"></div>
            </div>
          ) : (
            <div className="p-6">
              {error && (
                <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-200">
                  {error}
                </div>
              )}
              {readOnlyNotice && (
                <div className="mb-6 rounded-md border border-amber-300 bg-amber-50 p-4 text-amber-900">
                  {readOnlyNotice}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Logo Section */}
                <div className="md:col-span-1 flex flex-col items-center">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    Institution logo
                  </div>

                  <div
                    className="relative flex h-40 w-40 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 dark:border-neutral-700"
                    onClick={handleLogoClick}
                  >
                    {uploading ? (
                      <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
                      </div>
                    ) : organization.logo_url ? (
                      <div className="h-full w-full relative">
                        <Image
                          src={organization.logo_url}
                          alt={organization.name}
                          layout="fill"
                          objectFit="contain"
                        />
                      </div>
                    ) : (
                      <div className="text-center p-4">
                        <Upload className="h-10 w-10 text-gray-400 mx-auto" />
                        <p className="text-sm text-gray-500 mt-2">
                          Click to upload logo
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          JPEG, PNG, GIF, SVG (max 2MB)
                        </p>
                      </div>
                    )}

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleLogoChange}
                      accept="image/jpeg,image/png,image/gif,image/svg+xml"
                      className="hidden"
                    />
                  </div>

                  {organization.logo_url && (
                    <button
                      type="button"
                      onClick={handleDeleteLogo}
                      className="mt-2 inline-flex items-center text-sm text-rose-600 transition hover:text-rose-700"
                      disabled={uploading}
                    >
                      <Trash className="h-4 w-4 mr-1" />
                      Remove logo
                    </button>
                  )}
                </div>

                {/* Institution details */}
                <div className="md:col-span-2">
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Institution name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Building className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="block w-full rounded-xl border-slate-200 py-2 pl-10 pr-3 text-sm shadow-sm focus:border-orange-300 focus:ring-orange-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-slate-100 dark:focus:border-orange-700 dark:focus:ring-orange-900/40"
                            placeholder="Institution name"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Abbreviation
                        </label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            name="abbreviation"
                            value={formData.abbreviation}
                            onChange={handleChange}
                            className="block w-full rounded-xl border-slate-200 py-2 pl-10 pr-3 text-sm shadow-sm focus:border-orange-300 focus:ring-orange-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-slate-100 dark:focus:border-orange-700 dark:focus:ring-orange-900/40"
                            placeholder="Short code"
                            maxLength={5}
                          />
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          Short code for the institution (1-5 characters). Used for
                          feed types, etc.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address
                        </label>
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          rows="3"
                          className="block w-full rounded-xl border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-orange-300 focus:ring-orange-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-slate-100 dark:focus:border-orange-700 dark:focus:ring-orange-900/40"
                          placeholder="Address"
                        ></textarea>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contact Email
                          </label>
                          <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Mail className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="email"
                              name="contact_email"
                              value={formData.contact_email}
                              onChange={handleChange}
                              className="block w-full rounded-xl border-slate-200 py-2 pl-10 pr-3 text-sm shadow-sm focus:border-orange-300 focus:ring-orange-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-slate-100 dark:focus:border-orange-700 dark:focus:ring-orange-900/40"
                              placeholder="Contact Email"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contact Phone
                          </label>
                          <div className="relative rounded-md shadow-sm">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <Phone className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                              type="text"
                              name="contact_phone"
                              value={formData.contact_phone}
                              onChange={handleChange}
                              className="block w-full rounded-xl border-slate-200 py-2 pl-10 pr-3 text-sm shadow-sm focus:border-orange-300 focus:ring-orange-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-slate-100 dark:focus:border-orange-700 dark:focus:ring-orange-900/40"
                              placeholder="Contact Phone"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <button
                        type="submit"
                        disabled={saving}
                        className={`flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm ${
                          saving
                            ? 'bg-orange-400'
                            : 'bg-orange-600 hover:bg-orange-700'
                        } focus:outline-none focus:ring-2 focus:ring-orange-100 dark:focus:ring-orange-900/40`}
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            Save Settings
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
    </div>
  )
}
