import { withSentryConfig } from '@sentry/nextjs';
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
      const host = u.hostname === 'localhost' ? '127.0.0.1' : u.hostname
      const port = u.port || (u.protocol === 'https:' ? '443' : '80')
      return `${u.protocol}//${host}:${port}`
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
        source: '/platform/tenants',
        destination: '/platform/institutions',
        permanent: false,
      },
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

export default withSentryConfig(nextConfig, {
 // For all available options, see:
 // https://www.npmjs.com/package/@sentry/webpack-plugin#options

 org: "hei-tech",

 project: "javascript-nextjs",

 // Only print logs for uploading source maps in CI
 silent: !process.env.CI,

 // For all available options, see:
 // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

 // Upload a larger set of source maps for prettier stack traces (increases build time)
 widenClientFileUpload: true,

 // Uncomment to route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
 // This can increase your server load as well as your hosting bill.
 // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
 // side errors will fail.
 // tunnelRoute: "/monitoring",

 webpack: {
   // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
   // See the following for more information:
   // https://docs.sentry.io/product/crons/
   // https://vercel.com/docs/cron-jobs
   automaticVercelMonitors: true,

   // Tree-shaking options for reducing bundle size
   treeshake: {
     // Automatically tree-shake Sentry logger statements to reduce bundle size
     removeDebugLogging: true,
   },
 }
});
