"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Sparkles, Upload, MessageSquare } from "lucide-react";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-950 pt-16">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[400px] rounded-full bg-purple-600/10 blur-[100px]" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="container relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge className="mb-6 gap-1.5 border-violet-500/30 bg-violet-500/10 text-violet-300 px-4 py-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Powered by Claude AI
          </Badge>

          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight">
            Chat with your{" "}
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              documents
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Upload PDFs and instantly get answers, summaries, and insights through
            natural conversation. Transform static documents into interactive
            knowledge bases.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button asChild variant="gradient" size="lg" className="gap-2 text-base">
              <Link href="/register">
                Start for free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="gap-2 text-base border-white/20 text-white hover:bg-white/10 bg-transparent"
            >
              <Link href="#how-it-works">See how it works</Link>
            </Button>
          </div>

          {/* Demo Preview */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative max-w-4xl mx-auto"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-indigo-600/20 rounded-2xl blur-xl" />
            <div className="relative rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur overflow-hidden shadow-2xl">
              {/* Mock browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-slate-900">
                <div className="h-3 w-3 rounded-full bg-red-500/70" />
                <div className="h-3 w-3 rounded-full bg-amber-500/70" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/70" />
                <div className="ml-3 flex-1 rounded-md bg-slate-800 px-3 py-1 text-xs text-slate-500">
                  app.docuchat.ai/documents/research-paper
                </div>
              </div>
              {/* Mock chat UI */}
              <div className="grid grid-cols-5 divide-x divide-white/10" style={{ height: "320px" }}>
                <div className="col-span-2 p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium uppercase tracking-wider">
                    <Upload className="h-3 w-3" />
                    Documents
                  </div>
                  {["research-paper.pdf", "annual-report.pdf", "thesis.pdf"].map((doc, i) => (
                    <div
                      key={doc}
                      className={`flex items-center gap-2 rounded-lg p-2.5 text-sm ${
                        i === 0 ? "bg-violet-500/20 text-violet-300" : "text-slate-400"
                      }`}
                    >
                      <div className="h-7 w-7 rounded bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-400">
                        PDF
                      </div>
                      <span className="truncate">{doc}</span>
                    </div>
                  ))}
                </div>
                <div className="col-span-3 p-4 flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium uppercase tracking-wider">
                    <MessageSquare className="h-3 w-3" />
                    Conversation
                  </div>
                  <div className="space-y-3 flex-1">
                    <div className="flex justify-end">
                      <div className="max-w-[80%] rounded-xl bg-violet-600/80 px-3 py-2 text-xs text-white">
                        What are the key findings of this paper?
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="h-6 w-6 shrink-0 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                        AI
                      </div>
                      <div className="rounded-xl bg-slate-800 px-3 py-2 text-xs text-slate-300 leading-relaxed">
                        The paper identifies <span className="text-violet-300">3 key findings</span>: improved
                        accuracy by 23%, reduced processing time, and better scalability...
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
