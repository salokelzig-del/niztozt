"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useUser } from "@clerk/nextjs";
import type { Comment } from "@/data/videos";
import { CloseIcon } from "./icons";

type CommentsSheetProps = {
  open: boolean;
  onClose: () => void;
  comments: Comment[];
  onAddComment: (text: string) => void | Promise<void>;
};

export default function CommentsSheet({
  open,
  onClose,
  comments,
  onAddComment,
}: CommentsSheetProps) {
  const { isSignedIn } = useUser();
  const [text, setText] = useState("");
  const [mounted, setMounted] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  async function submit() {
    const trimmedText = text.trim();
    if (!trimmedText || sending) return;
    setSending(true);
    try {
      await onAddComment(trimmedText);
      setText("");
    } finally {
      setSending(false);
    }
  }

  if (!mounted) return null;

  return createPortal(
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/70 transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        className="fixed inset-x-0 bottom-0 z-50 flex h-[65vh] flex-col rounded-t-3xl border-t border-white/10 bg-[#0d0f16] transition-transform duration-300 ease-out"
        style={{ transform: open ? "translateY(0)" : "translateY(100%)" }}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <p className="font-semibold text-white">
            {comments.length} comentarios
          </p>
          <button
            onClick={onClose}
            aria-label="Cerrar comentarios"
            className="rounded-full p-1 text-white/60 hover:text-white"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {comments.length === 0 && (
            <p className="pt-8 text-center text-sm text-white/40">
              Sé el primero en comentar ✦
            </p>
          )}
          {comments.map((c) => (
            <div key={c.id} className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-amber-400 text-xs font-bold text-white">
                {c.user.charAt(0)}
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-300">{c.user}</p>
                <p className="text-sm text-white/90">{c.text}</p>
              </div>
            </div>
          ))}
        </div>

        {isSignedIn ? (
          <div className="flex items-center gap-2 border-t border-white/10 p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Agregá un comentario..."
              className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-amber-400/50 focus:outline-none"
            />
            <button
              onClick={submit}
              disabled={sending || !text.trim()}
              className="rounded-full bg-gradient-to-br from-amber-400 to-blue-600 px-4 py-2 text-sm font-semibold text-black disabled:opacity-40"
            >
              {sending ? "..." : "Enviar"}
            </button>
          </div>
        ) : (
          <p className="border-t border-white/10 p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] text-center text-sm text-white/50">
            Iniciá sesión para comentar
          </p>
        )}
      </div>
    </>,
    document.body
  );
}
