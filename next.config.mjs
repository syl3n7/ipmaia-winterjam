/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure we properly handle client-side only code
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: false, // Changed to false to prevent issues with API calls
  output: 'standalone',
  images: {
    unoptimized: true
  }
};

export default nextConfig;
