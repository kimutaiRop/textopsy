import "server-only";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set. Database operations are not available.");
}

/**
 * Cache the database connection in development. This avoids creating a new connection on every HMR
 * update. Following the pattern from the Drizzle + Next.js article.
 */
const globalForDb = globalThis as unknown as {
  conn: Pool | undefined;
  db: ReturnType<typeof drizzle> | undefined;
};

// Parse DATABASE_URL to extract connection parameters
function parseDatabaseUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    return {
      host: parsedUrl.hostname,
      port: parseInt(parsedUrl.port) || 5432,
      user: parsedUrl.username,
      password: parsedUrl.password,
      database: parsedUrl.pathname.slice(1), // Remove leading '/'
      ssl: parsedUrl.searchParams.get("sslmode") === "require" ? { rejectUnauthorized: false } : false,
    };
  } catch (error) {
    // If URL parsing fails, try to use the URL directly (some providers use connection strings)
    return {
      connectionString: url,
    };
  }
}

// Create a single Pool instance that's reused across requests
// The Pool handles connection management automatically
const client = globalForDb.conn ?? new Pool(
  parseDatabaseUrl(databaseUrl)
);

// Configure pool settings to prevent blocking
client.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
  });

  if (process.env.NODE_ENV !== "production") {
  globalForDb.conn = client;
  }

// Create Drizzle instance with the Pool
// This is synchronous and non-blocking - the Pool handles connections lazily
export const db = globalForDb.db ?? drizzle(client, { schema });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.db = db;
  }

// Export schema for convenience
export * from "./schema";

