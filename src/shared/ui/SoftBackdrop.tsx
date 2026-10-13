import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

/** Full-height page background: soft colour glows over the theme background. */
export function SoftBackdrop({
  children,
  strong = false,
  sx,
}: {
  children: ReactNode;
  /** Stronger glow, for the auth pages. */
  strong?: boolean;
  sx?: SxProps<Theme>;
}) {
  const [a, b] = strong ? [0.28, 0.22] : [0.2, 0.15];
  return (
    <Box
      sx={[
        {
          minHeight: "100vh",
          background: `radial-gradient(900px 500px at 12% 0%, rgba(var(--mui-palette-primary-mainChannel) / ${a}), transparent 60%), radial-gradient(800px 500px at 100% 70%, rgba(255,140,200,${b}), transparent 60%), var(--mui-palette-background-default)`,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {children}
    </Box>
  );
}
