// Client-safe vocabulary shared by the UI and the server-side schemas: plain
// constants and types only, so importing it never pulls in zod, i18n or Node.

export const IMPORTANCES = ["NORMAL", "IMPORTANT", "CRITICAL"] as const;
export type Importance = (typeof IMPORTANCES)[number];

/** Longest search text accepted. */
export const MAX_SEARCH_LENGTH = 200;

/** Longest range one request may ask for (a 6-week month grid is 42 days). */
export const MAX_RANGE_DAYS = 100;

/** Events per List view page. */
export const PAGE_SIZE = 20;
