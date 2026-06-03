/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure we properly handle client-side only code
  reactStrictMode: true,
  poweredByHeader: false,
  trailingSlash: false, // Changed to false to prevent issues with API calls
  images: {
    unoptimized: true
  },
};

export default nextConfig;

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
