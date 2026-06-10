"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap } from "lucide-react";
import { PLAN_DETAILS } from "@/lib/plans";

const plans = [
  {
    key: "FREE",
    ...PLAN_DETAILS.FREE,
    badge: null,
    cta: "Get started free",
    href: "/register",
    highlighted: false,
  },
  {
    key: "PRO",
    ...PLAN_DETAILS.PRO,
    badge: "Most Popular",
    cta: "Start Pro trial",
    href: "/register?plan=pro",
    highlighted: true,
  },
  {
    key: "ENTERPRISE",
    ...PLAN_DETAILS.ENTERPRISE,
    badge: null,
    cta: "Contact sales",
    href: "/register?plan=enterprise",
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-slate-900">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Start free. Upgrade when you need more power.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              viewport={{ once: true }}
              className={`relative rounded-2xl border p-8 ${
                plan.highlighted
                  ? "border-violet-500 bg-gradient-to-b from-violet-500/10 to-transparent"
                  : "border-white/10 bg-slate-800/50"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge className="gap-1 bg-violet-600 text-white border-0 px-3 py-1">
                    <Zap className="h-3 w-3" />
                    {plan.badge}
                  </Badge>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                <p className="text-sm text-slate-400">{plan.description}</p>
              </div>

              <div className="mb-8">
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-extrabold text-white">
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-slate-400 mb-1">/month</span>
                  )}
                </div>
                {plan.price === 0 && (
                  <p className="text-slate-400 text-sm mt-1">Forever free</p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm text-slate-300">
                    <Check className="h-4 w-4 shrink-0 text-violet-400" />
                    {feature}
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className="w-full"
                variant={plan.highlighted ? "gradient" : "outline"}
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
