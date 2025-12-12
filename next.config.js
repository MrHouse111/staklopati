/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    esmExternals: 'loose'
  },
  webpack: (config) => {
    config.externals = [...config.externals, { canvas: "canvas" }]; // required to make pdfjs work
    return config;
  },
  // Configure Next.js image handling. Unoptimized images are used to allow
  // deployment via static export, and remote patterns are whitelisted for
  // external hosts such as klopati.rs and ucarecdn.com.
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'klopati.rs',
      },
      {
        protocol: 'https',
        hostname: 'ucarecdn.com',
      },
    ],
  },
};

module.exports = nextConfig;