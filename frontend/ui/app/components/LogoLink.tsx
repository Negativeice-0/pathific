import Image from "next/image";
import Link from "next/link";

export default function LogoLink({ href = "/", size = 100 }: { href?: string; size?: number }) {
  return (
    <Link href={href} className="inline-block">
      <Image
        src="/images/logo.svg"
        alt="Pathific Logo"
        width={size}
        height={size * 0.33} // keep aspect ratio
        priority
      />
    </Link>
  );
}
