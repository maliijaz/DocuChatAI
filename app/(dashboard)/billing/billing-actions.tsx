"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink, Zap } from "lucide-react";
import { Plan } from "@/lib/types";
import { toast } from "sonner";

interface BillingActionsProps {
  plan?: Plan;
  hasSubscription: boolean;
}

export function BillingActions({ plan, hasSubscription }: BillingActionsProps) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!plan) return;
    setLoading(true);
    try {
      const res = await fetch("/api/billing/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start checkout");
      setLoading(false);
    }
  };

  const handlePortal = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Portal failed");
      window.location.href = data.url;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to open billing portal");
      setLoading(false);
    }
  };

  if (hasSubscription && !plan) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handlePortal}
        disabled={loading}
        className="gap-2"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ExternalLink className="h-4 w-4" />}
        Manage subscription
      </Button>
    );
  }

  if (plan) {
    return (
      <Button
        className="w-full gap-2"
        size="sm"
        onClick={handleUpgrade}
        disabled={loading}
        variant="gradient"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
        Upgrade to {plan === "PRO" ? "Pro" : "Enterprise"}
      </Button>
    );
  }

  return null;
}
