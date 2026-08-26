"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles } from "lucide-react";

const FEATURES = [
  "Unlimited conversations",
  "Fast AI models, no throttling",
  "Document summaries & key insights",
  "Multiple documents & chat history",
  "No credit card, ever",
];

export function Pricing() {
  return (
    <section id="pricing" className="py-24 bg-slate-900">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            100% free. No catch.
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Every feature, unlocked, for everyone. No tiers, no trials, no credit card.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true }}
          className="relative max-w-md mx-auto rounded-2xl border border-violet-500 bg-gradient-to-b from-violet-500/10 to-transparent p-8"
        >
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
            <Badge className="gap-1 bg-violet-600 text-white border-0 px-3 py-1">
              <Sparkles className="h-3 w-3" />
              Forever free
            </Badge>
          </div>

          <div className="mb-6 text-center">
            <h3 className="text-xl font-bold text-white mb-1">DocuChat AI</h3>
            <p className="text-sm text-slate-400">Everything you need, for free</p>
          </div>

          <div className="mb-8 text-center">
            <span className="text-5xl font-extrabold text-white">$0</span>
            <p className="text-slate-400 text-sm mt-1">Forever, no upgrade needed</p>
          </div>

          <ul className="space-y-3 mb-8">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2.5 text-sm text-slate-300">
                <Check className="h-4 w-4 shrink-0 text-violet-400" />
                {feature}
              </li>
            ))}
          </ul>

          <Button asChild className="w-full" variant="gradient">
            <Link href="/register">Get started free</Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
