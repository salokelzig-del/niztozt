"use client";

import { useState } from "react";
import { useClerk, useUser } from "@clerk/nextjs";

export default function FollowButton({
  targetUserId,
  initialFollowing,
  initialFollowerCount,
}: {
  targetUserId: string;
  initialFollowing: boolean;
  initialFollowerCount: number;
}) {
  const { user } = useUser();
  const clerk = useClerk();
  const [following, setFollowing] = useState(initialFollowing);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [busy, setBusy] = useState(false);

  if (user?.id === targetUserId) return null;

  async function toggle() {
    if (!user) {
      clerk.openSignIn({});
      return;
    }
    if (busy) return;
    setBusy(true);
    const next = !following;
    setFollowing(next);
    setFollowerCount((c) => (next ? c + 1 : c - 1));
    try {
      const res = await fetch(`/api/users/${targetUserId}/follow`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ following: next }),
      });
      if (res.ok) {
        const data = await res.json();
        setFollowerCount(data.followerCount);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors disabled:opacity-60 ${
        following
          ? "border border-white/20 text-white"
          : "bg-gradient-to-br from-amber-400 to-blue-600 text-black"
      }`}
    >
      {following ? "Siguiendo" : "Seguir"} · {followerCount}
    </button>
  );
}
