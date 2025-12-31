import type { Metadata } from "next";
import Link from "next/link";
import LogoLink from "../components/LogoLink";

export const metadata: Metadata = {
  title: "Pathific",
  description: "Structured learning for a social-first world.",
  icons: {
    icon: "/images/logo.svg",
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-[#121826] text-[#e6e8ee] flex flex-col">
      {/* Top bar */}
      <div className="flex justify-between items-center p-4">
        <LogoLink href="/" size={48} />
        <Link href="/learnmore" className="text-sm font-semibold hover:text-sky-300">
          Learn More
        </Link>
      </div>

      {/* Centered content */}
      <div className="flex flex-1 items-center justify-center">
        {children}
      </div>
    </main>
  );
}
