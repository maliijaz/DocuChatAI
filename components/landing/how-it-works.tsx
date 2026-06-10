"use client";

import { motion } from "framer-motion";
import { Upload, Cpu, MessageSquare, Lightbulb } from "lucide-react";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Upload your PDF",
    description:
      "Drag & drop or click to upload any PDF. We support research papers, reports, contracts, books, and more up to 200MB.",
    color: "bg-violet-500",
  },
  {
    icon: Cpu,
    step: "02",
    title: "AI processes it",
    description:
      "Our system extracts text, chunks it intelligently, and indexes it for lightning-fast retrieval. Usually done in seconds.",
    color: "bg-indigo-500",
  },
  {
    icon: MessageSquare,
    step: "03",
    title: "Start a conversation",
    description:
      "Ask questions in plain English. Our AI understands context and retrieves the most relevant parts of your document.",
    color: "bg-blue-500",
  },
  {
    icon: Lightbulb,
    step: "04",
    title: "Get instant insights",
    description:
      "Receive accurate answers with source citations, generate summaries, or extract key data points — all in seconds.",
    color: "bg-cyan-500",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-slate-950">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            How it works
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            From upload to insight in under a minute.
          </p>
        </div>

        <div className="relative">
          {/* Connecting line */}
          <div className="absolute top-16 left-1/2 hidden lg:block w-3/4 -translate-x-1/2 h-px bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="relative text-center"
              >
                <div className="relative inline-flex mb-6">
                  <div
                    className={`h-14 w-14 rounded-2xl ${step.color} flex items-center justify-center shadow-lg`}
                  >
                    <step.icon className="h-7 w-7 text-white" />
                  </div>
                  <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center text-xs font-bold text-slate-400">
                    {i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
