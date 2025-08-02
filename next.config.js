/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: [
      'supabase.co',
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com',
      'github.com'
    ],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=300, stale-while-revalidate=60',
          },
        ],
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/docs',
        destination: '/docs/setup/free-setup',
        permanent: false,
      },
    ]
  },
  webpack: (config, { isServer, dev }) => {
    // Optimize for free deployments
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }

    // Reduce bundle size in production
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      }
    }

    return config
  },
  // Enable compression
  compress: true,
  // Optimize for edge functions
  experimental: {
    ...nextConfig.experimental,
    runtime: 'nodejs',
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  // Environment variable configuration
  env: {
    CUSTOM_KEY: 'ai-automation-platform',
  },
  // Output configuration for static export (if needed)
  output: process.env.NEXT_OUTPUT || undefined,
  // Disable x-powered-by header
  poweredByHeader: false,
}

module.exports = nextConfig