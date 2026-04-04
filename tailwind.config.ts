import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 32px -12px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255,255,255,0.06)",
        "soft-lg":
          "0 24px 48px -12px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255,255,255,0.05)",
        premium:
          "0 1px 0 rgba(255,255,255,0.7) inset, 0 12px 40px -16px rgba(79, 70, 229, 0.18), 0 4px 16px -8px rgba(15, 23, 42, 0.08)",
        "premium-hover":
          "0 1px 0 rgba(255,255,255,0.85) inset, 0 20px 48px -16px rgba(79, 70, 229, 0.22), 0 8px 24px -8px rgba(15, 23, 42, 0.1)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
