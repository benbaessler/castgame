/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@castgame/shared"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
