import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure data files are copied to the output directory
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        'better-sqlite3': 'commonjs better-sqlite3',
      });
    }
    return config;
  },
  
  // Add turbopack config to avoid build errors (Next.js 16 requirement)
  turbopack: {
    // Empty config tells Next.js we acknowledge Turbopack but want to keep webpack too
  },
  
  // Output as standalone for Netlify
  output: 'standalone',
};

export default nextConfig;
