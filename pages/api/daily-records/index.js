/**
 * Legacy Supabase proxy — removed. Use Nsuo with JWT:
 * GET/POST /api/v1/units/:unitId/daily-records
 * Bulk: POST /api/v1/units/:unitId/daily-records/bulk
 */
export default function handler(_req, res) {
  return res.status(410).json({
    error:
      'This endpoint is deprecated. Use Nsuo daily-records under /units/:unitId/daily-records.',
    code: 'DEPRECATED_DAILY_RECORDS_API',
  })
}
