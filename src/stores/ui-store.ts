import type { ReactNode } from "react";
import { create } from "zustand";

export type UpgradeModalReason =
  | "form_limit"
  | "lead_limit"
  | "manual"
  | "session_nudge";

type UiState = {
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  upgradeModalOpen: boolean;
  upgradeModalReason: UpgradeModalReason | null;
  openUpgradeModal: (reason?: UpgradeModalReason) => void;
  closeUpgradeModal: () => void;
  /** Right side of the dashboard top bar (set from page-level client components). */
  dashboardHeaderActions: ReactNode | null;
  setDashboardHeaderActions: (node: ReactNode | null) => void;
};

export const useUiStore = create<UiState>((set) => ({
  mobileNavOpen: false,
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  upgradeModalOpen: false,
  upgradeModalReason: null,
  openUpgradeModal: (reason = "manual") =>
    set({ upgradeModalOpen: true, upgradeModalReason: reason }),
  closeUpgradeModal: () =>
    set({ upgradeModalOpen: false, upgradeModalReason: null }),
  dashboardHeaderActions: null,
  setDashboardHeaderActions: (node) => set({ dashboardHeaderActions: node }),
}));
