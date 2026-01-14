import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Force rebuild - cache bust
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },
};

export default nextConfig;
