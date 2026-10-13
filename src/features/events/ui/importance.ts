import type { Importance } from "../lib/schemas";

/** Calendar colours by Importance (white text stays readable on all three). */
export const IMPORTANCE_COLORS: Record<Importance, string> = {
  NORMAL: "#1f5fbf",
  IMPORTANT: "#b45309",
  CRITICAL: "#c62828",
};
