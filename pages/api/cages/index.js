/**
 * Legacy Supabase proxy — removed. Use Nsuo with JWT:
 * GET/POST /api/v1/farms/:farmId/units
 */
export default function handler(_req, res) {
  return res.status(410).json({
    error:
      'This endpoint is deprecated. Use Nsuo farm units under /farms/:farmId/units.',
    code: 'DEPRECATED_CAGES_API',
  })
}
