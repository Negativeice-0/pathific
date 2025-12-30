import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pathific",
  description: "Structured learning for a social-first world."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        {/* No global navbar here to keep Welcome minimal */}
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
