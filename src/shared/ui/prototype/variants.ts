// PROTOTYPE (throwaway): the UI variants being compared via ?variant=.
export const VARIANTS = [
  { key: "A", name: "Notion-like" },
  { key: "B", name: "Google Calendar-like" },
  { key: "C", name: "Soft / rounded" },
] as const;

export type VariantKey = (typeof VARIANTS)[number]["key"];

export function parseVariant(value: string | null | undefined): VariantKey {
  return VARIANTS.find((v) => v.key === value)?.key ?? "A";
}
