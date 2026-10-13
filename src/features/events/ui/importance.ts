import { uk } from "@/shared/i18n/uk";
import type { Importance } from "../lib/constants";

export type ImportancePresentation = {
  label: string;
  /** Background colour; `textColor` stays readable on all three. */
  color: string;
  textColor: string;
};

const TEXT_COLOR = "#ffffff";

const COLORS: Record<Importance, string> = {
  NORMAL: "#1f5fbf",
  IMPORTANT: "#b45309",
  CRITICAL: "#c62828",
};

/** How an Importance level looks and reads on screen. */
export function presentationOf(level: Importance): ImportancePresentation {
  return {
    label: uk.importance[level],
    color: COLORS[level],
    textColor: TEXT_COLOR,
  };
}
