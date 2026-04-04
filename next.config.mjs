/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure we properly handle client-side only code
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: false, // Changed to false to prevent issues with API calls
  output: 'standalone',
  images: {
    unoptimized: true
  },
  experimental: {
    // Enable the instrumentation hook (required for Next.js < 15; no-op in Next.js 15+
    // where it is enabled by default and the flag is no longer needed).
    instrumentationHook: true,
  },
};

export default nextConfig;
