import type { Metadata } from "next";
import Footer from "../components/Footer";
import NavBar from "../components/NavBar";
import "../globals.css";

export const metadata: Metadata = {
  title: "Pathific",
  description: "Structured learning for a social-first world.",
  icons: {
    icon: "/images/logo.svg",
  },
};

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#0b0d10] text-white min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
