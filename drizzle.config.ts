import type { Config } from "drizzle-kit";

export default {
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Use DATABASE_DIRECT_URL for drizzle-kit operations if available (for serverless/proxied URLs)
    // Otherwise fall back to DATABASE_URL
    url: process.env.DATABASE_DIRECT_URL || process.env.DATABASE_URL!,
  },
} satisfies Config;

