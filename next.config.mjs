/** @type {import('next').NextConfig} */

/**
 * Where `/api/backend/*` is proxied in dev (browser axios uses that path when
 * NEXT_PUBLIC_API_URL points at localhost).
 * - Prefer API_PROXY_TARGET when set.
 * - Else derive from NEXT_PUBLIC_API_URL if it is localhost (keeps .env.local in sync).
 * - Else default to 3000 (common Nest/Express dev port). Use `next dev -p 3001` if the API
 *   already uses 3000 on the same machine.
 */
function resolveApiProxyTarget() {
  const explicit = process.env.API_PROXY_TARGET?.trim().replace(/\/$/, '')
  if (explicit) return explicit

  const pub = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, '')
  if (pub) {
    try {
      const u = new URL(pub)
      if (u.hostname === 'localhost' || u.hostname === '127.0.0.1') {
        const host = u.hostname === 'localhost' ? '127.0.0.1' : u.hostname
        const port =
          u.port || (u.protocol === 'https:' ? '443' : '80')
        return `${u.protocol}//${host}:${port}`
      }
    } catch {
      /* fall through */
    }
  }

  return 'http://127.0.0.1:3000'
}

const apiProxyTarget = resolveApiProxyTarget()

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/',
        headers: [
          {
            key: 'Cache-Control',
            value:
              'private, no-store, no-cache, must-revalidate, max-age=0',
          },
        ],
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/register-company',
        destination: '/register',
        permanent: true,
      },
      {
        source: '/platform/organisations',
        destination: '/dashboard?admin=catalog',
        permanent: false,
      },
      {
        source: '/platform/organisations/:orgId',
        destination: '/dashboard?admin=catalog',
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
    // PostHog first-party `/ingest` proxy. Include dev so analytics requests are not handled by
    // Next (which would 500 and spam vendor-chunk errors when the SDK points at `/ingest`).
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
