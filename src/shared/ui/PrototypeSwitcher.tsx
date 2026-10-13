"use client";

// PROTOTYPE (throwaway, branch prototype/ui-redesign): floating bottom-centre
// pill that cycles ?variant= between UI variants. Hidden in production builds.

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect } from "react";

export type PrototypeVariant = { key: string; name?: string };

export function PrototypeSwitcher({
  variants,
}: {
  variants: readonly PrototypeVariant[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requested = searchParams.get("variant");
  const index = Math.max(
    0,
    variants.findIndex((v) => v.key === requested)
  );

  const go = useCallback(
    (delta: number) => {
      const next =
        variants[(index + delta + variants.length) % variants.length];
      if (!next) return;
      const params = new URLSearchParams(window.location.search);
      params.set("variant", next.key);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [index, pathname, router, variants]
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
        return;
      }
      const el = event.target as HTMLElement | null;
      if (
        el &&
        (el.closest("input, textarea, select, [contenteditable]") ||
          el.isContentEditable)
      ) {
        return;
      }
      go(event.key === "ArrowLeft" ? -1 : 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  if (process.env.NODE_ENV === "production") return null;

  const current = variants[index];
  const arrow = {
    color: "inherit",
    width: 28,
    height: 28,
    "&:hover": { bgcolor: "rgba(255,255,255,0.18)" },
  } as const;

  return (
    <Box
      data-prototype-switcher
      sx={{
        position: "fixed",
        bottom: 12,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        px: 0.75,
        py: 0.5,
        borderRadius: 999,
        bgcolor: "#111",
        color: "#fff",
        boxShadow: "0 4px 18px rgba(0,0,0,0.4)",
        border: "1px solid rgba(255,255,255,0.25)",
        maxWidth: "calc(100vw - 24px)",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <IconButton
        size="small"
        aria-label="Previous variant"
        onClick={() => go(-1)}
        sx={arrow}
      >
        ←
      </IconButton>
      <Typography
        variant="caption"
        sx={{
          px: 1,
          fontWeight: 600,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        PROTOTYPE · {current?.key}
        {current?.name ? ` (${current.name})` : ""}
      </Typography>
      <IconButton
        size="small"
        aria-label="Next variant"
        onClick={() => go(1)}
        sx={arrow}
      >
        →
      </IconButton>
    </Box>
  );
}
