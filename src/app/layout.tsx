import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "LeadApp — Turn visitors into qualified leads",
    template: "%s | LeadApp",
  },
  description:
    "Publish forms, share links, and capture leads in one inbox. Fast setup, no code, built for modern teams.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://leadaap.com"
  ),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body
        className={cn(
          inter.variable,
          "min-h-dvh touch-manipulation font-sans text-base antialiased"
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
