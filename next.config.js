/** @type {import('next').NextConfig} */
const nextConfig = {
  onDemandEntries: {
    maxInactiveAge: 15 * 1000,
    pagesBufferLength: 2,
  },
  webpack: (config, { isServer }) => {
    config.cache = false;
    return config;
  },
};
module.exports = nextConfig;
