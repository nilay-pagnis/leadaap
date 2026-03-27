import { Suspense } from "react";
import { PaymentConfirmClient } from "./payment-confirm-client";

export default function BillingConfirmPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg py-12 text-sm text-gray-500">
          Loading…
        </div>
      }
    >
      <PaymentConfirmClient />
    </Suspense>
  );
}
