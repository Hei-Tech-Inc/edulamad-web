/**
 * Legacy Supabase proxy — removed. Use Nsuo with JWT:
 * GET/PATCH /api/v1/farms/:farmId/units/:unitId
 */
export default function handler(_req, res) {
  return res.status(410).json({
    error:
      'This endpoint is deprecated. Use Nsuo unit routes under /farms/:farmId/units/:id.',
    code: 'DEPRECATED_CAGE_DETAIL_API',
  })
}
