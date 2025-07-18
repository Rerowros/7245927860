import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Предупреждение: это отключает ESLint во время сборки
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Предупреждение: это отключает проверку типов во время сборки
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
