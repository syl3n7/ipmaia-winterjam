/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure we properly handle client-side only code
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: true,
  output: 'standalone',
  images: {
    unoptimized: true
  }
};

export default nextConfig;
