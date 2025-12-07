/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ensure Next builds this app directory as the root (fixes monorepo/root inference warnings)
  turbopack: {
    root: process.cwd(),
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
