import { cva, type VariantProps } from "class-variance-authority";

/**
 * Shared button styles (no "use client") so Server Components can style links
 * like buttons without importing the client `button.tsx` module.
 */
export const buttonVariants = cva(
  "group/button inline-flex max-w-full min-w-0 shrink-0 items-center justify-center rounded-xl border border-transparent bg-clip-padding text-sm font-medium transition-all duration-200 ease-in-out outline-none select-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 motion-safe:hover:scale-[1.02] motion-safe:active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_1px_2px_rgba(15,23,42,0.06)] hover:shadow-md hover:brightness-[1.02] dark:hover:brightness-110",
        outline:
          "border border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-slate-50 hover:text-slate-900 dark:border-white/15 dark:bg-white/5 dark:text-gray-100 dark:hover:bg-white/10",
        secondary:
          "border border-slate-200 bg-white text-slate-900 shadow-sm hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-gray-100 dark:hover:bg-white/10",
        ghost:
          "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "min-h-9 gap-2 px-4 py-2 has-data-[icon=inline-end]:pr-3 has-data-[icon=inline-start]:pl-3",
        xs: "min-h-7 gap-1 rounded-md px-2.5 py-1.5 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        sm: "min-h-8 gap-1.5 rounded-lg px-3 py-1.5 text-[0.8125rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "min-h-11 gap-2 px-5 py-2.5 text-[0.9375rem] has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-9 shrink-0 p-0 [&_svg]:size-4",
        "icon-xs":
          "size-6 shrink-0 rounded-md p-0 in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-8 shrink-0 rounded-lg p-0 in-data-[slot=button-group]:rounded-lg [&_svg]:size-4",
        "icon-lg": "size-10 shrink-0 p-0 [&_svg]:size-5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
