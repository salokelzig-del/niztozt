"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import type { Comment, Video } from "@/data/videos";
import { handleToSlug } from "@/lib/handle";
import {
  CommentIcon,
  EyeIcon,
  FlagIcon,
  HeartIcon,
  MusicNoteIcon,
  ShareIcon,
  SpeakerOffIcon,
  SpeakerOnIcon,
  StarOfDavidIcon,
  TrashIcon,
} from "./icons";
import CommentsSheet from "./CommentsSheet";
import ShareSheet from "./ShareSheet";

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return `${n}`;
}

export default function VideoCard({
  video,
  initialLiked,
}: {
  video: Video;
  initialLiked: boolean;
}) {
  const { isSignedIn, user } = useUser();
  const clerk = useClerk();
  const router = useRouter();
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(video.likes);
  const [comments, setComments] = useState<Comment[]>(video.comments);
  const [showComments, setShowComments] = useState(false);
  const [muted, setMuted] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [reported, setReported] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const isOwner = Boolean(user && video.userId && user.id === video.userId);

  useEffect(() => {
    const videoEl = videoRef.current;
    const sectionEl = sectionRef.current;
    if (!sectionEl) return;

    let viewCounted = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoEl?.play().catch(() => {});
          if (!viewCounted) {
            viewCounted = true;
            fetch(`/api/videos/${video.id}/view`, { method: "POST" }).catch(() => {});
          }
        } else {
          videoEl?.pause();
        }
      },
      { threshold: 0.6 }
    );
    observer.observe(sectionEl);
    return () => observer.disconnect();
  }, [video.id]);

  async function toggleLike() {
    if (!isSignedIn) {
      clerk.openSignIn({});
      return;
    }
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount((c) => (nextLiked ? c + 1 : c - 1));
    try {
      await fetch(`/api/videos/${video.id}/like`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ liked: nextLiked }),
      });
    } catch {
      // Simplificación: si falla la red, el contador local queda desincronizado
      // hasta la próxima recarga. No hay reintento automático.
    }
  }

  function openComments() {
    if (!isSignedIn) {
      clerk.openSignIn({});
      return;
    }
    setShowComments(true);
  }

  function share() {
    setShowShare(true);
  }

  async function addComment(text: string) {
    const res = await fetch(`/api/videos/${video.id}/comments`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) return;
    const comment: Comment = await res.json();
    setComments((prev) => [...prev, comment]);
  }

  async function handleDelete() {
    if (deleting) return;
    const confirmed = window.confirm(
      "¿Seguro que querés borrar este video? No se puede deshacer."
    );
    if (!confirmed) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/videos/${video.id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        setDeleting(false);
      }
    } catch {
      setDeleting(false);
    }
  }

  async function handleReport() {
    if (!isSignedIn) {
      clerk.openSignIn({});
      return;
    }
    if (reported) return;
    setReported(true);
    try {
      await fetch(`/api/videos/${video.id}/report`, { method: "POST" });
    } catch {
      setReported(false);
    }
  }

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full shrink-0 snap-start snap-always overflow-hidden"
    >
      {video.videoUrl ? (
        <video
          ref={videoRef}
          src={video.videoUrl}
          className="absolute inset-0 h-full w-full object-cover"
          loop
          muted={muted}
          playsInline
          onClick={() => setMuted((m) => !m)}
        />
      ) : (
        <div className={`absolute inset-0 bg-gradient-to-br ${video.gradient}`}>
          <div className="absolute inset-0 flex items-center justify-center text-white/5">
            <StarOfDavidIcon className="h-72 w-72" />
          </div>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/5 to-black/50" />

      <span className="absolute left-4 top-20 rounded-full border border-amber-400/40 bg-black/30 px-3 py-1 text-xs font-medium text-amber-300 backdrop-blur-sm">
        {video.category}
      </span>

      {video.videoUrl && (
        <button
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Activar sonido" : "Silenciar"}
          className="absolute right-4 top-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm"
        >
          {muted ? <SpeakerOffIcon className="h-5 w-5" /> : <SpeakerOnIcon className="h-5 w-5" />}
        </button>
      )}

      <div className="absolute right-3 bottom-32 flex flex-col items-center gap-6">
        <Link
          href={`/perfil/${handleToSlug(video.handle)}`}
          aria-label={`Ver perfil de ${video.user}`}
          className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-amber-400 bg-gradient-to-br from-blue-700 to-blue-950 text-sm font-bold text-white"
        >
          {video.user.charAt(0)}
        </Link>

        <button
          onClick={toggleLike}
          className="flex flex-col items-center gap-1"
          aria-label="Me gusta"
        >
          <HeartIcon
            filled={liked}
            className={`h-8 w-8 transition-colors ${liked ? "text-amber-400" : "text-white"}`}
          />
          <span className="text-xs font-semibold text-white">{formatCount(likeCount)}</span>
        </button>

        <button
          onClick={openComments}
          className="flex flex-col items-center gap-1"
          aria-label="Comentarios"
        >
          <CommentIcon className="h-8 w-8 text-blue-300" />
          <span className="text-xs font-semibold text-white">{formatCount(comments.length)}</span>
        </button>

        <button
          onClick={share}
          className="flex flex-col items-center gap-1"
          aria-label="Compartir"
        >
          <ShareIcon className="h-8 w-8 text-white" />
          <span className="text-xs font-semibold text-white">Compartir</span>
        </button>

        {isOwner ? (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex flex-col items-center gap-1 disabled:opacity-50"
            aria-label="Borrar video"
          >
            <TrashIcon className="h-7 w-7 text-red-400" />
            <span className="text-xs font-semibold text-white">
              {deleting ? "..." : "Borrar"}
            </span>
          </button>
        ) : (
          <button
            onClick={handleReport}
            disabled={reported}
            className="flex flex-col items-center gap-1"
            aria-label="Reportar video"
          >
            <FlagIcon
              className={`h-7 w-7 ${reported ? "text-amber-400" : "text-white/70"}`}
            />
            <span className="text-xs font-semibold text-white">
              {reported ? "Reportado" : "Reportar"}
            </span>
          </button>
        )}
      </div>

      <div className="absolute bottom-24 left-4 right-24 text-white">
        <Link href={`/perfil/${handleToSlug(video.handle)}`} className="font-bold text-base">
          {video.handle}
        </Link>
        <p className="mt-1.5 text-sm leading-snug">{video.description}</p>
        <p className="mt-2 text-xs font-medium text-amber-300">{video.hashtags.join(" ")}</p>
        <div className="mt-2 flex items-center gap-2 text-xs text-white/80">
          <MusicNoteIcon className="h-3.5 w-3.5" />
          <span>{video.music}</span>
        </div>
        <div className="mt-1.5 flex items-center gap-1.5 text-xs text-white/60">
          <EyeIcon className="h-3.5 w-3.5" />
          <span>{formatCount(video.views || 0)} vistas</span>
        </div>
      </div>

      <CommentsSheet
        open={showComments}
        onClose={() => setShowComments(false)}
        comments={comments}
        onAddComment={addComment}
      />

      <ShareSheet
        open={showShare}
        onClose={() => setShowShare(false)}
        url={`https://regatv.vercel.app/video/${video.id}`}
        text={video.description}
      />
    </section>
  );
}
