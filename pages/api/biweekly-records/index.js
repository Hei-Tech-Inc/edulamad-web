/**
 * Legacy Supabase proxy — removed. Use Nsuo:
 * - GET/POST /api/v1/units/:unitId/weight-samples (with JWT)
 * - Farm unit list: /api/v1/farms/:farmId/units
 */
export default function handler(_req, res) {
  return res.status(410).json({
    error: 'This endpoint is deprecated. Use Nsuo weight-samples under /units/:unitId/weight-samples.',
    code: 'DEPRECATED_BIWEEKLY_API',
  })
}
