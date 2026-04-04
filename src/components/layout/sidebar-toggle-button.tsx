"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/ui-store";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

/**
 * Desktop (lg+): collapse / expand the primary sidebar. Hidden on small screens (drawer uses the menu button).
 */
export function SidebarToggleButton({ className }: Props) {
  const collapsed = useUiStore((s) => s.sidebarCollapsedDesktop);
  const toggle = useUiStore((s) => s.toggleSidebarCollapsedDesktop);

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(
        "hidden shrink-0 rounded-xl lg:inline-flex",
        className
      )}
      onClick={toggle}
      aria-expanded={!collapsed}
      aria-controls="app-sidebar"
      title={collapsed ? "Show sidebar" : "Hide sidebar"}
    >
      {collapsed ? (
        <PanelLeftOpen className="size-5" aria-hidden />
      ) : (
        <PanelLeftClose className="size-5" aria-hidden />
      )}
      <span className="sr-only">{collapsed ? "Show sidebar" : "Hide sidebar"}</span>
    </Button>
  );
}
