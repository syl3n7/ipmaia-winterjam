/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config) => {
      config.module.exprContextCritical = false;
      return config;
    },
  };
  
  module.exports = nextConfig;
  