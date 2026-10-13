// Fail fast: validate configuration when the server starts, not on first use.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { getEnv } = await import("@/shared/config");
    getEnv();
  }
}
