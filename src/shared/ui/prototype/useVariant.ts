"use client";

// PROTOTYPE (throwaway): current ?variant= key (default A).
import { useSearchParams } from "next/navigation";
import { parseVariant, type VariantKey } from "./variants";

export function useVariant(): VariantKey {
  return parseVariant(useSearchParams().get("variant"));
}
