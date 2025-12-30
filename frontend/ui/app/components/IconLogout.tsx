"use client";
import Image from "next/image";

type Props = { className?: string; alt?: string };

export default function IconLogout({ className, alt = "Logout" }: Props) {
  return (
    <Image
      src="/icons/logout.svg"
      alt={alt}
      width={24}
      height={24}
      className={className}
      priority
    />
  );
}
