import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  reactCompiler: true,
  allowedDevOrigins: ['192.168.31.132'],
};

export default nextConfig;

initOpenNextCloudflareForDev();
