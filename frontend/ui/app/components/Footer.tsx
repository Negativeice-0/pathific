import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-12 bg-white/10 backdrop-blur-md border-t border-white/20 rounded-t-xl px-6 py-8 text-center">
      <p className="text-white/80">Samples by AI for human review.</p>
      <div className="mt-4 flex justify-center gap-6 text-sm text-white/60">
        <Link href="/faq" className="hover:text-sky-300">FAQs</Link>
        <Link href="/quicklinks" className="hover:text-sky-300">Quicklinks</Link>
        <Link href="/contact" className="hover:text-sky-300">Contact</Link>
      </div>
    </footer>
  );
}
