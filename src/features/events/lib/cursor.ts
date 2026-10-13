// The List view's keyset position and its opaque wire form. Server-only: it
// uses Node's Buffer.

/** Keyset position: the last (startsAt, id) the client has already seen. */
export type Cursor = { startsAt: Date; id: string };

/** The cursor is opaque to clients: base64url of JSON [startsAt ISO, id]. */
export function encodeCursor(cursor: Cursor): string {
  return Buffer.from(
    JSON.stringify([cursor.startsAt.toISOString(), cursor.id])
  ).toString("base64url");
}

/** Null when `raw` is not a cursor this module produced. */
export function decodeCursor(raw: string): Cursor | null {
  try {
    const parsed: unknown = JSON.parse(
      Buffer.from(raw, "base64url").toString("utf8")
    );
    if (!Array.isArray(parsed) || parsed.length !== 2) return null;
    const [iso, id] = parsed;
    if (typeof iso !== "string" || typeof id !== "string" || !id) return null;
    const startsAt = new Date(iso);
    if (Number.isNaN(startsAt.getTime())) return null;
    return { startsAt, id };
  } catch {
    return null;
  }
}
