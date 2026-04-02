/**
 * Legacy Supabase proxy — removed. Use Nsuo with JWT:
 * GET/POST /api/v1/units/:unitId/harvests
 */
export default function handler(_req, res) {
  return res.status(410).json({
    error:
      'This endpoint is deprecated. Use Nsuo harvests under /units/:unitId/harvests.',
    code: 'DEPRECATED_HARVEST_RECORDS_API',
  })
}
