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
  
  // 👇👇👇 OVO JE NOVI DEO ZA ANDROID (CORS) 👇👇👇
  async headers() {
    return [
      {
        // Dozvoljavamo pristup API-ju sa svih uređaja (telefona)
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" }, // Zvezdica znači "slobodan ulaz" za aplikaciju
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ],
      },
    ]
  },
  // 👆👆👆 KRAJ NOVOG DELA 👆👆👆
};

module.exports = nextConfig;