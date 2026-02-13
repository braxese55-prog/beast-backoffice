/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed 'output: export' to allow API routes to work as serverless functions
  // Static export doesn't support API routes - they need server-side execution
  distDir: 'dist', // Vercel project is configured to look for 'dist' directory
}

export default nextConfig
