import { execSync } from "node:child_process";
import "dotenv/config";

/**
 * Applies migrations to the dedicated test database once, before any worker
 * starts. Requires a running Postgres (`docker compose up -d`, or the CI
 * service container) reachable through TEST_DATABASE_URL.
 */
export default function setup() {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) {
    throw new Error(
      "TEST_DATABASE_URL is not set. Copy .env.example to .env and run `docker compose up -d`."
    );
  }
  execSync("npx prisma migrate deploy", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: url },
  });
}
