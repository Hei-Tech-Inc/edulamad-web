/** @type {import('next').NextConfig} */
const apiProxyTarget =
  (process.env.API_PROXY_TARGET || 'http://127.0.0.1:5001').replace(/\/$/, '')

const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: '/register-company',
        destination: '/register',
        permanent: true,
      },
      {
        source: '/platform/organisations',
        destination: '/platform/tenants',
        permanent: false,
      },
      {
        source: '/platform/organisations/:orgId',
        destination: '/platform/tenants?org=:orgId',
        permanent: false,
      },
    ]
  },
  async rewrites() {
    const rules = [
      {
        source: '/api/backend/:path*',
        destination: `${apiProxyTarget}/:path*`,
      },
    ]
    // Only proxy PostHog in production builds — in dev the proxy runs in Node and often
    // ETIMEDOUTs (jamming the terminal) while the browser can reach PostHog directly.
    if (process.env.NODE_ENV !== 'development') {
      rules.push(
        {
          source: '/ingest/static/:path*',
          destination: 'https://us-assets.i.posthog.com/static/:path*',
        },
        {
          source: '/ingest/:path*',
          destination: 'https://us.i.posthog.com/:path*',
        },
      )
    }
    return rules
  },
  skipTrailingSlashRedirect: true,
  // Fix chunk loading issues
  webpack: (config, { isServer }) => {
    // Ensure proper module resolution
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    }
    
    return config
  },
}

export default nextConfig
