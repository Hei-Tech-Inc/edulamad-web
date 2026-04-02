/**
 * Legacy Supabase analytics — removed. Use Nsuo APIs and in-app dashboards
 * (daily-records, weight-samples, harvests, farm summary) with JWT.
 */
export default function handler(_req, res) {
  return res.status(410).json({
    error:
      'This endpoint is deprecated. Use Nsuo operational APIs or pages that call them directly.',
    code: 'DEPRECATED_ANALYTICS_API',
  })
}
