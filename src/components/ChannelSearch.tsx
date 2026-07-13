"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { handleToSlug } from "@/lib/handle";
import { SearchIcon } from "./icons";

type AuthorResult = {
  name: string;
  handle: string;
  userId?: string;
  videoCount: number;
};

export default function ChannelSearch() {
  const [query, setQuery] = useState("");
  const [authors, setAuthors] = useState<AuthorResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data = await res.json();
          setAuthors(data.authors);
        }
      } catch {
        // búsqueda cancelada o sin red; se reintenta al tipear de nuevo
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  return (
    <div>
      <div className="relative mb-5">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscá canales por nombre..."
          autoFocus
          className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-white/40 focus:border-amber-400/50 focus:outline-none"
        />
      </div>

      {loading ? (
        <p className="pt-10 text-center text-sm text-white/40">Buscando...</p>
      ) : authors.length === 0 ? (
        <p className="pt-10 text-center text-sm text-white/40">
          No encontramos canales con ese nombre
        </p>
      ) : (
        <ul className="space-y-2">
          {authors.map((a) => (
            <li key={a.handle}>
              <Link
                href={`/perfil/${handleToSlug(a.handle)}`}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-amber-400 bg-gradient-to-br from-blue-700 to-blue-950 text-sm font-bold text-white">
                  {a.name.charAt(0)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-white">
                    {a.name}
                  </span>
                  <span className="block truncate text-xs text-amber-300">{a.handle}</span>
                </span>
                <span className="shrink-0 text-xs text-white/50">
                  {a.videoCount} {a.videoCount === 1 ? "video" : "videos"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
