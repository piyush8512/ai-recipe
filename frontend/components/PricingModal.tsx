"use client";

import { ReactNode, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PricingSection, { SubscriptionTier } from "./PricingSection";

interface PricingModalProps {
  subscriptionTier?: SubscriptionTier;
  children: ReactNode;
}

export default function PricingModal({
  subscriptionTier = "free",
  children,
}: PricingModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Only allow opening if user is on free plan
  const canOpen = subscriptionTier === "free";

  return (
    <Dialog open={isOpen} onOpenChange={canOpen ? setIsOpen : undefined}>
      <DialogTrigger asChild disabled={!canOpen}>
        {children}
      </DialogTrigger>

      <DialogContent className="sm:max-w-4xl">
        <DialogTitle>Pricing</DialogTitle>
        <div>
          <PricingSection
            subscriptionTier={subscriptionTier}
            isModal={true}
            onClose={() => setIsOpen(false)}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
