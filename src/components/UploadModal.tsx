"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { createPortal } from "react-dom";
import { uploadPresigned } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import { CloseIcon } from "./icons";
import { getLocalUserName, setLocalUserName } from "@/lib/localUser";

const MAX_VIDEO_BYTES = 200 * 1024 * 1024;

type UploadModalProps = {
  open: boolean;
  onClose: () => void;
};

export default function UploadModal({ open, onClose }: UploadModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "uploading" | "saving" | "error">("idle");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    setName(getLocalUserName());
  }, []);

  useEffect(() => {
    if (open) {
      setFile(null);
      setDescription("");
      setCategory("");
      setHashtags("");
      setProgress(0);
      setStatus("idle");
      setError("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }, [open]);

  const isBusy = status === "uploading" || status === "saving";

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;
    if (selected.size > MAX_VIDEO_BYTES) {
      setError("El video es muy pesado (máximo 200MB).");
      return;
    }
    setError("");
    setFile(selected);
  }

  async function handleSubmit() {
    if (!file || !name.trim() || !description.trim() || !category.trim()) {
      setError("Completá todos los campos y elegí un video.");
      return;
    }
    setError("");
    setLocalUserName(name.trim());

    try {
      setStatus("uploading");
      setProgress(0);
      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const pathname = `videos/${Date.now()}-${safeName}`;
      const blob = await uploadPresigned(pathname, file, {
        access: "public",
        handleUploadUrl: "/api/blob-upload",
        contentType: file.type,
        onUploadProgress: ({ percentage }) => setProgress(percentage),
      });

      setStatus("saving");
      const res = await fetch("/api/videos", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          user: name.trim(),
          description: description.trim(),
          category: category.trim(),
          hashtags: hashtags
            .split(",")
            .map((h) => h.trim())
            .filter(Boolean)
            .map((h) => (h.startsWith("#") ? h : `#${h}`)),
          videoUrl: blob.url,
        }),
      });
      if (!res.ok) throw new Error("No se pudo guardar el video");

      setStatus("idle");
      onClose();
      router.refresh();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Algo salió mal, probá de nuevo.");
    }
  }

  if (!mounted) return null;

  return createPortal(
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/70 transition-opacity ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => !isBusy && onClose()}
      />
      <div
        className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col rounded-t-3xl border-t border-white/10 bg-[#0d0f16] transition-transform duration-300 ease-out"
        style={{ transform: open ? "translateY(0)" : "translateY(100%)" }}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <p className="font-semibold text-white">Subir video</p>
          <button
            onClick={() => !isBusy && onClose()}
            aria-label="Cerrar"
            className="rounded-full p-1 text-white/60 hover:text-white"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <div>
            <label className="mb-1 block text-xs font-medium text-white/60">Video</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={handleFileChange}
              disabled={isBusy}
              className="block w-full text-sm text-white file:mr-3 file:rounded-full file:border-0 file:bg-gradient-to-br file:from-amber-400 file:to-blue-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-black"
            />
            {file && (
              <p className="mt-1 text-xs text-white/50">
                {file.name} ({(file.size / (1024 * 1024)).toFixed(1)} MB)
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-white/60">Tu nombre</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
              disabled={isBusy}
              placeholder="Ej: Yael Cohen"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-amber-400/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-white/60">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={200}
              disabled={isBusy}
              rows={3}
              placeholder="Contanos de qué se trata tu video..."
              className="w-full resize-none rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-amber-400/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-white/60">Categoría</label>
            <input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              maxLength={30}
              disabled={isBusy}
              placeholder="Ej: Humor, Cocina, Música..."
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-amber-400/50 focus:outline-none"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-white/60">
              Hashtags (separados por coma, opcional)
            </label>
            <input
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              disabled={isBusy}
              placeholder="Shabat, Familia, Tradicion"
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-amber-400/50 focus:outline-none"
            />
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}

          {isBusy && (
            <div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-blue-600 transition-all"
                  style={{ width: `${status === "saving" ? 100 : progress}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-white/50">
                {status === "uploading" ? `Subiendo... ${Math.round(progress)}%` : "Guardando..."}
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-white/10 p-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
          <button
            onClick={handleSubmit}
            disabled={isBusy}
            className="w-full rounded-full bg-gradient-to-br from-amber-400 to-blue-600 py-3 text-sm font-semibold text-black disabled:opacity-50"
          >
            {isBusy ? "Publicando..." : "Publicar"}
          </button>
        </div>
      </div>
    </>,
    document.body
  );
}
