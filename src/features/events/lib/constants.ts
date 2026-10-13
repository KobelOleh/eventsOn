// Client-safe vocabulary shared by the UI and the server-side schemas: plain
// constants and types only, so importing it never pulls in zod, i18n or Node.

export const IMPORTANCES = ["NORMAL", "IMPORTANT", "CRITICAL"] as const;
export type Importance = (typeof IMPORTANCES)[number];

/** Longest search text accepted. */
export const MAX_SEARCH_LENGTH = 200;
