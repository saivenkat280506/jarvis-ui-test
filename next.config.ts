import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve("."),
  },
  allowedDevOrigins: ["127.0.0.1", "localhost"],
  devIndicators: {
    position: "bottom-right",
  },
};

export default nextConfig;
