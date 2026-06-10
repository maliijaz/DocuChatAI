import Link from "next/link";
import { FileText } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left panel - branding */}
      <div className="hidden lg:flex flex-col bg-slate-950 p-10">
        <Link href="/" className="flex items-center gap-2 font-bold text-white text-xl">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
            <FileText className="h-4 w-4 text-white" />
          </div>
          DocuChat AI
        </Link>

        <div className="flex-1 flex items-center">
          <div>
            <blockquote className="space-y-4">
              <p className="text-2xl font-medium text-white leading-relaxed">
                &ldquo;DocuChat AI transformed how our team processes research papers.
                What used to take hours now takes minutes.&rdquo;
              </p>
              <footer className="text-slate-400">
                <div className="font-semibold text-white">Dr. Sarah Chen</div>
                <div className="text-sm">Research Director, BioTech Labs</div>
              </footer>
            </blockquote>
          </div>
        </div>

        <div className="flex gap-4 text-xs text-slate-500">
          <span>🔒 SOC 2 compliant</span>
          <span>🌍 GDPR ready</span>
          <span>🔐 End-to-end encrypted</span>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-xl mb-10 lg:hidden"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600">
              <FileText className="h-4 w-4 text-white" />
            </div>
            DocuChat AI
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
