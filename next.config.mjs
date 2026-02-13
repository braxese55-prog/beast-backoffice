/** @type {import('next').NextConfig} */
const nextConfig = {
  // Removed 'output: export' to allow API routes to work as serverless functions
  // Static export doesn't support API routes - they need server-side execution
  // distDir: 'dist', // Optional - Vercel uses .next by default
}

export default nextConfig
