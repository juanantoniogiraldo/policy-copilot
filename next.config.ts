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
  
  // Output as standalone for Netlify
  output: 'standalone',
};

export default nextConfig;
