import "dotenv/config";

// Every test worker talks to the dedicated test database, never the dev one.
if (!process.env.TEST_DATABASE_URL) {
  throw new Error("TEST_DATABASE_URL is not set.");
}
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
