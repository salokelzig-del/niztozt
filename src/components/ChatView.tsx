"use client";

import { useEffect, useRef, useState } from "react";

type ChatMessage = {
  id: string;
  from: string;
  fromName: string;
  text: string;
  ts: number;
};

export default function ChatView({
  partnerId,
  selfId,
  initialMessages,
}: {
  partnerId: string;
  selfId: string;
  initialMessages: ChatMessage[];
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messageCount = useRef(initialMessages.length);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "instant" });
  }, []);

  useEffect(() => {
    if (messages.length > messageCount.current) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
    messageCount.current = messages.length;
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/conversations/${partnerId}/messages`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages);
        }
      } catch {
        // sin red; reintenta en el próximo ciclo
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [partnerId]);

  async function send() {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${partnerId}/messages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: trimmed }),
      });
      if (res.ok) {
        const message: ChatMessage = await res.json();
        setMessages((prev) => [...prev, message]);
        setText("");
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="no-scrollbar flex-1 space-y-2 overflow-y-auto px-4 py-3">
        {messages.length === 0 && (
          <p className="pt-16 text-center text-sm text-white/40">
            Empezá la conversación ✦
          </p>
        )}
        {messages.map((m) => {
          const mine = m.from === selfId;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  mine
                    ? "bg-gradient-to-br from-amber-400 to-blue-600 text-black"
                    : "bg-white/10 text-white"
                }`}
              >
                {m.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 border-t border-white/10 p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Escribí un mensaje..."
          maxLength={500}
          className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-amber-400/50 focus:outline-none"
        />
        <button
          onClick={send}
          disabled={sending || !text.trim()}
          className="rounded-full bg-gradient-to-br from-amber-400 to-blue-600 px-4 py-2 text-sm font-semibold text-black disabled:opacity-40"
        >
          {sending ? "..." : "Enviar"}
        </button>
      </div>
    </div>
  );
}
