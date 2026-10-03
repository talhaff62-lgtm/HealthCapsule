import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  serverExternalPackages: ["sharp", "isomorphic-dompurify", "jsdom", "marked"],
  turbopack: {
    root: path.join(__dirname, ".."),
  },
};

export default nextConfig;
