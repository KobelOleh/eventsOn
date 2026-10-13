import { auth } from "./nextauth";

export class UnauthorizedError extends Error {
  constructor() {
    super("UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

/** The signed-in user, or null (for pages that adapt to either state). */
export async function getSessionUser(): Promise<{
  id: string;
  email: string | null;
} | null> {
  const session = await auth();
  const user = session?.user;
  if (!user?.id) return null;
  return { id: user.id, email: user.email ?? null };
}

/**
 * The signed-in user's id, read from the session (never from client input).
 * Every Server Action of other modules calls this first; it does not rely on
 * the proxy. Throws UnauthorizedError for anonymous callers.
 */
export async function requireOwnerId(): Promise<string> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) throw new UnauthorizedError();
  return id;
}
