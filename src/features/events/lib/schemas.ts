import { z } from "zod";
import { uk } from "@/shared/i18n/uk";
import { IMPORTANCES, MAX_SEARCH_LENGTH } from "./constants";

const e = uk.events.errors;

/** An absolute instant with an explicit offset ("Z" or "+03:00"). */
const instant = (message: string) =>
  z.iso.datetime({ offset: true, error: message });

/**
 * Fields shared by create and edit. Unknown keys such as an
 * `ownerId` are stripped: the Owner comes only from the session.
 */
export const eventFieldsSchema = z.object({
  title: z
    .string({ error: e.titleRequired })
    .trim()
    .min(1, { error: e.titleRequired })
    .max(120, { error: e.titleTooLong }),
  description: z
    .string()
    .max(2000, { error: e.descriptionTooLong })
    .optional()
    .default(""),
  startsAt: instant(e.dateRequired).transform((value) => new Date(value)),
  importance: z
    .enum(IMPORTANCES, { error: e.importanceInvalid })
    .optional()
    .default("NORMAL"),
});

export type EventFields = z.output<typeof eventFieldsSchema>;

/** Longest range one request may ask for (a 6-week month grid is 42 days). */
export const MAX_RANGE_DAYS = 100;

/** Events per List view page. */
export const PAGE_SIZE = 20;

/** Keyset position: the last (startsAt, id) the client has already seen. */
export type Cursor = { startsAt: Date; id: string };

/** The cursor is opaque to clients: base64url of JSON [startsAt ISO, id]. */
export function encodeCursor(cursor: Cursor): string {
  return Buffer.from(
    JSON.stringify([cursor.startsAt.toISOString(), cursor.id])
  ).toString("base64url");
}

function decodeCursor(raw: string): Cursor | null {
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

/**
 * Filter and search shared by the Calendar range query and the List query.
 * No levels selected means "all"; a blank search means "no search".
 */
export const filterSchema = z.object({
  importance: z
    .array(z.enum(IMPORTANCES), { error: e.importanceInvalid })
    .optional()
    .transform((levels) => [...new Set(levels ?? [])]),
  q: z
    .string({ error: e.searchInvalid })
    .trim()
    .max(MAX_SEARCH_LENGTH, { error: e.searchTooLong })
    .optional()
    .transform((text) => text || undefined),
});

export type EventFilter = z.output<typeof filterSchema>;

/** List view request: optional cursor plus the shared filter. */
export const listQuerySchema = filterSchema.extend({
  cursor: z
    .string({ error: e.cursorInvalid })
    .optional()
    .transform((raw, ctx): Cursor | undefined => {
      if (raw === undefined) return undefined;
      const decoded = decodeCursor(raw);
      if (!decoded) {
        ctx.issues.push({
          code: "custom",
          message: e.cursorInvalid,
          input: raw,
        });
      }
      return decoded ?? undefined;
    }),
});

/** Half-open range [start, end) of start times. */
export const rangeSchema = filterSchema
  .extend({ start: instant(e.rangeInvalid), end: instant(e.rangeInvalid) })
  .refine(
    ({ start, end }) => {
      const span = Date.parse(end) - Date.parse(start);
      return span > 0 && span <= MAX_RANGE_DAYS * 86_400_000;
    },
    { error: e.rangeInvalid, path: ["end"] }
  )
  .transform(({ start, end, ...filter }) => ({
    start: new Date(start),
    end: new Date(end),
    filter,
  }));
