import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LeadAap — Turn visitors into paying clients",
  description:
    "Capture leads beautifully, follow up faster, and grow revenue — without another bloated stack.",
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
          jakarta.variable,
          "min-h-screen font-sans text-base antialiased [font-feature-settings:'cv02','cv03','cv04','cv11']"
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
