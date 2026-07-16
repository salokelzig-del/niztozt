"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CloseIcon } from "./icons";

type ShareSheetProps = {
  open: boolean;
  onClose: () => void;
  url: string;
  text: string;
};

function WhatsAppGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
      <path d="M12 2a10 10 0 0 0-8.66 15L2 22l5.16-1.3A10 10 0 1 0 12 2Zm5.1 13.9c-.22.62-1.28 1.2-1.78 1.24-.48.05-.93.23-3.12-.65-2.64-1.06-4.32-3.78-4.45-3.96-.13-.17-1.06-1.42-1.06-2.7 0-1.29.67-1.92.9-2.18.24-.26.52-.32.7-.32h.5c.16 0 .38-.06.6.45.22.53.75 1.83.81 1.96.07.13.11.29.02.46-.09.18-.13.28-.26.44-.13.15-.28.34-.4.46-.13.13-.27.28-.12.54.15.26.68 1.13 1.47 1.83 1.01.9 1.86 1.18 2.13 1.31.26.13.42.11.57-.07.16-.17.66-.77.84-1.03.17-.26.35-.22.59-.13.24.09 1.52.72 1.78.85.26.13.44.2.5.3.07.12.07.66-.15 1.3Z" />
    </svg>
  );
}

function FacebookGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
      <path d="M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.9 3.77-3.9 1.1 0 2.24.2 2.24.2v2.46H15.2c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.89h-2.33v6.99A10 10 0 0 0 22 12Z" />
    </svg>
  );
}

function XGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      <path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93Zm-1.29 19.5h2.04L6.49 3.24H4.3l13.3 17.4Z" />
    </svg>
  );
}

function TelegramGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
      <path d="M11.94 2a10 10 0 1 0 .12 20 10 10 0 0 0-.12-20Zm4.9 6.8-1.64 7.74c-.12.55-.45.68-.9.42l-2.5-1.84-1.2 1.16c-.14.13-.25.25-.5.25l.17-2.52 4.6-4.15c.2-.18-.05-.28-.31-.1l-5.69 3.58-2.45-.77c-.53-.17-.54-.53.11-.79l9.57-3.69c.44-.16.83.11.74.71Z" />
    </svg>
  );
}

export default function ShareSheet({ open, onClose, url, text }: ShareSheetProps) {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) setCopied(false);
  }, [open]);

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);

  const redes = [
    {
      name: "WhatsApp",
      color: "bg-[#25D366]",
      href: `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`,
      glyph: <WhatsAppGlyph />,
    },
    {
      name: "Facebook",
      color: "bg-[#1877F2]",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      glyph: <FacebookGlyph />,
    },
    {
      name: "X",
      color: "bg-neutral-700",
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      glyph: <XGlyph />,
    },
    {
      name: "Telegram",
      color: "bg-[#229ED9]",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      glyph: <TelegramGlyph />,
    },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // sin permiso de portapapeles
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title: "Rega", text, url });
      onClose();
    } catch {
      // el usuario cerró el menú nativo
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
        className="fixed inset-x-0 bottom-0 z-50 flex flex-col rounded-t-3xl border-t border-white/10 bg-[#0d0f16] transition-transform duration-300 ease-out"
        style={{ transform: open ? "translateY(0)" : "translateY(100%)" }}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <p className="font-semibold text-white">Compartir video</p>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-full p-1 text-white/60 hover:text-white"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-start justify-around px-4 py-5">
          {redes.map((red) => (
            <a
              key={red.name}
              href={red.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-16 flex-col items-center gap-1.5"
            >
              <span
                className={`flex h-12 w-12 items-center justify-center rounded-full text-white ${red.color}`}
              >
                {red.glyph}
              </span>
              <span className="text-[11px] text-white/70">{red.name}</span>
            </a>
          ))}
        </div>

        <div className="space-y-2 px-5 pb-[calc(env(safe-area-inset-bottom)+1.25rem)]">
          <button
            onClick={copyLink}
            className="w-full rounded-full border border-white/15 py-2.5 text-sm font-semibold text-white"
          >
            {copied ? "¡Enlace copiado! ✓" : "Copiar enlace"}
          </button>
          {typeof navigator !== "undefined" && "share" in navigator && (
            <button
              onClick={nativeShare}
              className="w-full rounded-full border border-white/15 py-2.5 text-sm font-semibold text-white"
            >
              Más opciones...
            </button>
          )}
        </div>
      </div>
    </>,
    document.body
  );
}
