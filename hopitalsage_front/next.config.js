/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000',
        pathname: '/media/**',
      },
      {
        protocol: 'https',
        hostname: 'pharmacie-hefk.onrender.com',
        pathname: '/media/**',
      },
    ],
  },

};

module.exports = nextConfig;
