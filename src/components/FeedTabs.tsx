"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function FeedTabs() {
  const pathname = usePathname();
  const isFollowing = pathname === "/siguiendo";

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-center justify-center gap-6 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3 text-sm font-semibold">
      <Link
        href="/siguiendo"
        className={`pointer-events-auto pb-1 ${
          isFollowing ? "border-b-2 border-amber-400 text-white" : "text-white/50"
        }`}
      >
        Siguiendo
      </Link>
      <Link
        href="/"
        className={`pointer-events-auto pb-1 ${
          !isFollowing ? "border-b-2 border-amber-400 text-white" : "text-white/50"
        }`}
      >
        Para ti
      </Link>
    </header>
  );
}
