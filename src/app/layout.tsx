import InitColorSchemeScript from "@mui/material/InitColorSchemeScript";
import type { Metadata } from "next";
import { Suspense, type ReactNode } from "react";
import { uk } from "@/shared/i18n/uk";
import { Providers } from "@/shared/ui/Providers";
import { PrototypeSwitcher } from "@/shared/ui/PrototypeSwitcher";
import { VARIANTS } from "@/shared/ui/prototype/variants";

export const metadata: Metadata = {
  title: uk.app.name,
  description: uk.app.tagline,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="uk" suppressHydrationWarning>
      <body>
        <InitColorSchemeScript attribute="data" />
        <Providers>{children}</Providers>
        {/* PROTOTYPE: variant switcher (hidden in production builds). */}
        <Suspense>
          <PrototypeSwitcher variants={VARIANTS} />
        </Suspense>
      </body>
    </html>
  );
}
