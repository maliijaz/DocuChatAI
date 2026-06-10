"use client";

import { motion } from "framer-motion";
import {
  MessageSquare,
  Search,
  FileText,
  Zap,
  Shield,
  BarChart3,
  Brain,
  Clock,
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Conversational Q&A",
    description:
      "Ask questions in natural language and get precise answers extracted directly from your documents with source citations.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: Brain,
    title: "AI Summarization",
    description:
      "Instantly generate comprehensive summaries covering key topics, findings, and conclusions from any document.",
    color: "from-blue-500 to-cyan-600",
  },
  {
    icon: Search,
    title: "Smart Search",
    description:
      "Find specific information across your documents with semantic search that understands context and meaning.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: BarChart3,
    title: "Key Insights",
    description:
      "Extract actionable insights, data points, and critical information automatically from complex documents.",
    color: "from-orange-500 to-amber-600",
  },
  {
    icon: FileText,
    title: "Multi-format Support",
    description:
      "Works with research papers, legal contracts, financial reports, textbooks, manuals, and more.",
    color: "from-pink-500 to-rose-600",
  },
  {
    icon: Zap,
    title: "Instant Processing",
    description:
      "Documents are processed and ready for conversation in seconds, not minutes. Start chatting right away.",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description:
      "Your documents are encrypted and never used for model training. Full data privacy guaranteed.",
    color: "from-slate-500 to-slate-700",
  },
  {
    icon: Clock,
    title: "Conversation History",
    description:
      "All your conversations are saved. Pick up where you left off and build on previous insights.",
    color: "from-indigo-500 to-violet-600",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-slate-900">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              understand documents
            </span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            A complete AI-powered toolkit for extracting knowledge from any PDF document.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              viewport={{ once: true }}
              className="group rounded-xl border border-white/10 bg-slate-800/50 p-6 hover:border-violet-500/30 hover:bg-slate-800 transition-all duration-300"
            >
              <div
                className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${feature.color}`}
              >
                <feature.icon className="h-5 w-5 text-white" />
              </div>
              <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
