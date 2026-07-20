"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { BellIcon } from "./icons";

export default function NotificationBell() {
  const { isSignedIn } = useUser();
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!isSignedIn) return;
    const check = () =>
      fetch("/api/notifications")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => data && setUnread(data.unread))
        .catch(() => {});
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, [isSignedIn, pathname]);

  if (!isSignedIn) return null;

  return (
    <Link
      href="/notificaciones"
      aria-label="Notificaciones"
      className="pointer-events-auto relative text-white"
    >
      <BellIcon className="h-6 w-6" />
      {unread > 0 && (
        <span className="absolute -right-1 -top-1 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-red-500 px-0.5 text-[9px] font-bold text-white">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
