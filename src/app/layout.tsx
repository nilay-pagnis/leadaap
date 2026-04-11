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
    default: "Enquireo — Capture. Qualify. Convert.",
    template: "%s | Enquireo",
  },
  description:
    "Turn every enquiry into a qualified opportunity with Enquireo.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://enquireo.com"
  ),
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
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
