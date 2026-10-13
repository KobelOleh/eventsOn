"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import CssBaseline from "@mui/material/CssBaseline";
import { Suspense, type ReactNode } from "react";
import { PrototypeThemeProvider } from "./prototype/PrototypeThemeProvider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AppRouterCacheProvider>
      {/* PROTOTYPE: theme follows ?variant= (was the single ./theme). */}
      <Suspense fallback={null}>
        <PrototypeThemeProvider>
          <CssBaseline />
          {children}
        </PrototypeThemeProvider>
      </Suspense>
    </AppRouterCacheProvider>
  );
}
