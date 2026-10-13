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
    <html lang="uk">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
