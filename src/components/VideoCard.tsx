"use client";

import { useState } from "react";
import type { Comment, Video } from "@/data/videos";
import { CommentIcon, HeartIcon, MusicNoteIcon, ShareIcon, StarOfDavidIcon } from "./icons";
import CommentsSheet from "./CommentsSheet";

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return `${n}`;
}

export default function VideoCard({ video }: { video: Video }) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(video.likes);
  const [comments, setComments] = useState<Comment[]>(video.comments);
  const [showComments, setShowComments] = useState(false);

  function toggleLike() {
    setLikeCount((c) => (liked ? c - 1 : c + 1));
    setLiked(!liked);
  }

  function addComment(text: string) {
    setComments((prev) => [
      ...prev,
      { id: `${video.id}-${prev.length}-${Date.now()}`, user: "Vos", text },
    ]);
  }

  return (
    <section className="relative h-screen w-full shrink-0 snap-start snap-always overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${video.gradient}`}>
        <div className="absolute inset-0 flex items-center justify-center text-white/5">
          <StarOfDavidIcon className="h-72 w-72" />
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/5 to-black/50" />

      <span className="absolute left-4 top-20 rounded-full border border-amber-400/40 bg-black/30 px-3 py-1 text-xs font-medium text-amber-300 backdrop-blur-sm">
        {video.category}
      </span>

      <div className="absolute right-3 bottom-32 flex flex-col items-center gap-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-amber-400 bg-gradient-to-br from-blue-700 to-blue-950 text-sm font-bold text-white">
          {video.user.charAt(0)}
        </div>

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
          onClick={() => setShowComments(true)}
          className="flex flex-col items-center gap-1"
          aria-label="Comentarios"
        >
          <CommentIcon className="h-8 w-8 text-blue-300" />
          <span className="text-xs font-semibold text-white">{formatCount(comments.length)}</span>
        </button>

        <button className="flex flex-col items-center gap-1" aria-label="Compartir">
          <ShareIcon className="h-8 w-8 text-white" />
          <span className="text-xs font-semibold text-white">Compartir</span>
        </button>
      </div>

      <div className="absolute bottom-24 left-4 right-24 text-white">
        <p className="font-bold text-base">{video.handle}</p>
        <p className="mt-1.5 text-sm leading-snug">{video.description}</p>
        <p className="mt-2 text-xs font-medium text-amber-300">{video.hashtags.join(" ")}</p>
        <div className="mt-2 flex items-center gap-2 text-xs text-white/80">
          <MusicNoteIcon className="h-3.5 w-3.5" />
          <span>{video.music}</span>
        </div>
      </div>

      <CommentsSheet
        open={showComments}
        onClose={() => setShowComments(false)}
        comments={comments}
        onAddComment={addComment}
      />
    </section>
  );
}
