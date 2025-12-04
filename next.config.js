/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['dl.airtable.com'],
  },
};

module.exports = nextConfig;

