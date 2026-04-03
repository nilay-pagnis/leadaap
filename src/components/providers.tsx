"use client";

import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { ScrollToTop } from "@/components/layout/scroll-to-top";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      storageKey="enquireo-theme"
    >
      {children}
      <ScrollToTop />
      <Toaster richColors position="top-center" />
    </ThemeProvider>
  );
}
