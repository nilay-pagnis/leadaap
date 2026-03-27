"use client";

import { useUiStore } from "@/stores/ui-store";
import type { UsageSnapshot } from "@/lib/monetization/get-usage";
import { UpgradeModal } from "./upgrade-modal";

export function UpgradeModalHost({ usage }: { usage: UsageSnapshot }) {
  const open = useUiStore((s) => s.upgradeModalOpen);
  const reason = useUiStore((s) => s.upgradeModalReason);
  const closeUpgradeModal = useUiStore((s) => s.closeUpgradeModal);

  return (
    <UpgradeModal
      open={open}
      onOpenChange={(next) => {
        if (!next) closeUpgradeModal();
      }}
      usage={usage}
      reason={reason}
    />
  );
}
