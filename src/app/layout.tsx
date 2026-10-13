import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { uk } from "@/shared/i18n/uk";
import { Providers } from "@/shared/ui/Providers";

export const metadata: Metadata = {
  title: uk.app.name,
  description: uk.app.tagline,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // The init script sets the colour scheme before first paint, so the
    // attribute legitimately differs between server and client HTML.
    <html lang="uk" suppressHydrationWarning>
      <body>
        <InitColorSchemeScript attribute="data" defaultMode="system" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
