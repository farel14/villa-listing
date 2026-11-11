import type { NextConfig } from "next";

// Cache Components is intentionally left off: every page here depends on
// per-request cookies (locale, currency, session), so the classic dynamic
// rendering model is simpler for this MVP.
const nextConfig: NextConfig = {
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
