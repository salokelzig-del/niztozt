"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ModerationActions({ videoId }: { videoId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"delete" | "ignore" | null>(null);

  async function handleDelete() {
    if (busy) return;
    const confirmed = window.confirm(
      "¿Borrar este video definitivamente? No se puede deshacer."
    );
    if (!confirmed) return;
    setBusy("delete");
    try {
      const res = await fetch(`/api/videos/${videoId}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setBusy(null);
    }
  }

  async function handleIgnore() {
    if (busy) return;
    setBusy("ignore");
    try {
      const res = await fetch(`/api/videos/${videoId}/ignore-reports`, {
        method: "POST",
      });
      if (res.ok) router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={handleDelete}
        disabled={busy !== null}
        className="rounded-full bg-red-500/90 px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
      >
        {busy === "delete" ? "Borrando..." : "Borrar video"}
      </button>
      <button
        onClick={handleIgnore}
        disabled={busy !== null}
        className="rounded-full border border-white/20 px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
      >
        {busy === "ignore" ? "..." : "Ignorar reportes"}
      </button>
    </div>
  );
}
