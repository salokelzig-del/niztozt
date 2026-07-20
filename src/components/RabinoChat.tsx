"use client";

import { useEffect, useRef, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "¿Qué se celebra en Januká?",
  "¿Por qué se enciende la vela de Shabat?",
  "Contame sobre la comida kosher",
  "¿Qué significa Mazal Tov?",
];

export default function RabinoChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setError("");
    const nextMessages: Message[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);

    // burbuja del asistente que se va llenando
    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/rabino", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessages((prev) => prev.slice(0, -1)); // sacar la burbuja vacía
        setError(data.error || "No se pudo responder. Probá de nuevo.");
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (reader) {
        let acc = "";
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = { role: "assistant", content: acc };
            return copy;
          });
        }
      }
    } catch {
      setMessages((prev) => prev.slice(0, -1));
      setError("Se cortó la conexión. Probá de nuevo.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="no-scrollbar flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 && (
          <div className="pt-4">
            <p className="text-center text-sm text-white/50">
              Preguntá lo que quieras sobre tradiciones, festividades, historia o costumbres judías.
            </p>
            <div className="mt-5 grid grid-cols-1 gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-left text-sm text-white/90"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${
                m.role === "user"
                  ? "bg-gradient-to-br from-amber-400 to-blue-600 text-black"
                  : "bg-white/10 text-white"
              }`}
            >
              {m.content || (sending ? "..." : "")}
            </div>
          </div>
        ))}

        {error && <p className="text-center text-xs text-red-400">{error}</p>}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-white/10 p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(input)}
            placeholder="Escribí tu pregunta..."
            disabled={sending}
            className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-amber-400/50 focus:outline-none disabled:opacity-60"
          />
          <button
            onClick={() => send(input)}
            disabled={sending || !input.trim()}
            className="rounded-full bg-gradient-to-br from-amber-400 to-blue-600 px-4 py-2 text-sm font-semibold text-black disabled:opacity-40"
          >
            {sending ? "..." : "Enviar"}
          </button>
        </div>
        <p className="mt-2 text-center text-[10px] leading-tight text-white/40">
          Guía Rega es una inteligencia artificial y puede equivocarse. No reemplaza a un rabino:
          para decisiones personales o religiosas, consultá con tu rabino o comunidad.
        </p>
      </div>
    </div>
  );
}
