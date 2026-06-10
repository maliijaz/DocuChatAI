"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { FileText, Menu, X } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-white">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
            <FileText className="h-4 w-4 text-white" />
          </div>
          DocuChat AI
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm text-slate-300 hover:text-white transition-colors">
            Features
          </Link>
          <Link href="#how-it-works" className="text-sm text-slate-300 hover:text-white transition-colors">
            How it works
          </Link>
          <Link href="#pricing" className="text-sm text-slate-300 hover:text-white transition-colors">
            Pricing
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {session ? (
            <Button asChild variant="gradient" size="sm">
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="text-slate-300 hover:text-white">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild variant="gradient" size="sm">
                <Link href="/register">Get started free</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="md:hidden text-slate-300 hover:text-white"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-slate-950 px-4 py-4 space-y-3">
          <Link href="#features" className="block text-sm text-slate-300 py-2">Features</Link>
          <Link href="#pricing" className="block text-sm text-slate-300 py-2">Pricing</Link>
          {session ? (
            <Button asChild className="w-full" variant="gradient">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button asChild variant="outline" className="w-full">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild variant="gradient" className="w-full">
                <Link href="/register">Get started</Link>
              </Button>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
