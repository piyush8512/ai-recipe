"use client";

import { PricingTable } from "@clerk/nextjs";

export type SubscriptionTier = "free" | "pro" | "premium" | string;

interface PricingSectionProps {
  subscriptionTier?: SubscriptionTier;
  isModal?: boolean;
  onClose?: () => void;
}

export default function PricingSection({
  subscriptionTier = "free",
}: PricingSectionProps) {
  return (
    <div className="max-w-6xl">
      <div>
        <h2 className="text-5xl md:text-6xl font-bold">Simple Pricing</h2>
        <p className="text-xl text-stone-600 font-light">
          Start for free. Upgrade to become a master chef.
        </p>
        <p className="text-sm text-stone-500 mt-2">
          Current plan: <span className="font-medium">{subscriptionTier}</span>
        </p>
      </div>

      <div className="grid md:grid-rows-2 max-w-4xl mx-auto">
        <PricingTable
          checkoutProps={{
            appearance: {
              elements: {
                drawerRoot: {
                  zIndex: 2000,
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
}
