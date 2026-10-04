/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    APP_VERSION: process.env.APP_VERSION || process.env.NEXT_PUBLIC_APP_VERSION || 'unknown',
    BUILD_DATE: process.env.BUILD_DATE || process.env.NEXT_PUBLIC_BUILD_DATE || 'unknown',
    GIT_SHA: process.env.GIT_SHA || process.env.NEXT_PUBLIC_GIT_SHA || 'unknown',
  },
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
