"use client";

import Image from "next/image";
import Link from "next/link";
import IconLogout from "../components/IconLogout";

export default function Navbar() {
  const handleLogout = () => {
    localStorage.removeItem("pathific_token");
    window.location.href = "/auth/login";
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-sm z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/images/logo.svg" alt="Pathific logo" width={32} height={32} priority />
          <span className="text-xl font-semibold text-blue-600">Pathific</span>
        </Link>
        <div className="flex items-center space-x-6">
          <Link href="/auth/register" className="text-gray-700 hover:text-blue-600">Register</Link>
          <Link href="/auth/login" className="text-gray-700 hover:text-blue-600">Login</Link>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-gray-700 hover:text-red-600"
            aria-label="Logout"
            title="Logout"
          >
            <IconLogout />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
