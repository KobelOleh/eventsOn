import Box from "@mui/material/Box";

/** The app's gradient logo mark. */
export function BrandMark({
  size = 26,
  round = true,
}: {
  size?: number;
  round?: boolean;
}) {
  return (
    <Box
      aria-hidden
      sx={{
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: round ? "50%" : 4,
        background: "linear-gradient(135deg, #8e7bff, #ff7eb6)",
        ...(!round && { boxShadow: "0 8px 20px rgba(142,123,255,0.45)" }),
      }}
    />
  );
}
