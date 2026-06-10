import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PLAN_DETAILS, PLAN_LIMITS } from "@/lib/plans";
import { Plan } from "@/lib/types";
import { DashboardHeader } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Check, Zap, ExternalLink, CreditCard } from "lucide-react";
import { BillingActions } from "./billing-actions";

export default async function BillingPage({
  searchParams,
}: {
  searchParams: { success?: string; cancelled?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      plan: true,
      stripeCustomerId: true,
      subscriptionStatus: true,
      _count: { select: { documents: true } },
    },
  });

  if (!user) redirect("/login");

  const plan = (user.plan as Plan) ?? "FREE";
  const planDetails = PLAN_DETAILS[plan];
  const limits = PLAN_LIMITS[plan];

  const plans = [
    { key: "FREE" as Plan, ...PLAN_DETAILS.FREE, highlighted: false },
    { key: "PRO" as Plan, ...PLAN_DETAILS.PRO, highlighted: true },
    { key: "ENTERPRISE" as Plan, ...PLAN_DETAILS.ENTERPRISE, highlighted: false },
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      <DashboardHeader
        title="Billing & Plans"
        description="Manage your subscription and upgrade your plan."
      />

      {searchParams.success && (
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 p-4 text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
          <Check className="h-5 w-5 text-emerald-600" />
          <div>
            <p className="font-semibold">Subscription activated!</p>
            <p className="text-sm">Your plan has been upgraded successfully.</p>
          </div>
        </div>
      )}

      {/* Current plan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Current plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl font-bold">{planDetails.name}</span>
                <Badge variant={plan === "FREE" ? "secondary" : "success"}>
                  {plan === "FREE" ? "Free" : "Active"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{planDetails.description}</p>
              <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                <span>{user._count.documents} / {limits.maxDocuments === Infinity ? "∞" : limits.maxDocuments} documents</span>
                <span>{limits.maxFileSizeMB}MB max file size</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">
                ${planDetails.price}
                <span className="text-base font-normal text-muted-foreground">{planDetails.price > 0 ? "/mo" : ""}</span>
              </p>
            </div>
          </div>

          {user.stripeCustomerId && (
            <>
              <Separator className="my-4" />
              <BillingActions hasSubscription={!!user.stripeCustomerId} />
            </>
          )}
        </CardContent>
      </Card>

      {/* Plan comparison */}
      <div>
        <h2 className="font-semibold text-lg mb-4">Available plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {plans.map((p) => (
            <Card
              key={p.key}
              className={`relative ${
                p.key === plan
                  ? "border-primary ring-1 ring-primary"
                  : p.highlighted
                  ? "border-violet-500/50"
                  : ""
              }`}
            >
              {p.key === plan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground text-xs">Current plan</Badge>
                </div>
              )}
              {p.highlighted && p.key !== plan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-violet-600 text-white text-xs gap-1">
                    <Zap className="h-3 w-3" />
                    Popular
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{p.name}</CardTitle>
                <div className="text-2xl font-bold">
                  ${p.price}
                  {p.price > 0 && <span className="text-sm font-normal text-muted-foreground">/mo</span>}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                {p.key !== plan && p.key !== "FREE" && (
                  <BillingActions plan={p.key} hasSubscription={false} />
                )}
                {p.key === "FREE" && plan !== "FREE" && (
                  <p className="text-xs text-muted-foreground text-center pt-1">
                    Cancel subscription to downgrade
                  </p>
                )}
                {p.key === plan && (
                  <Button disabled className="w-full" variant="outline" size="sm">
                    Current plan
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
