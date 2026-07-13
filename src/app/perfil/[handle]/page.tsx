import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import {
  getUserIdByHandle,
  getVideosByUserId,
  getVideosByHandle,
  getLikedVideoIdsForUser,
  getFollowerCount,
  isFollowing,
} from "@/lib/redis";
import { ArrowLeftIcon, InboxIcon } from "@/components/icons";
import AppShell from "@/components/AppShell";
import VideoCard from "@/components/VideoCard";
import FollowButton from "@/components/FollowButton";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const authorUserId = await getUserIdByHandle(handle);

  const { userId: viewerId } = await auth();
  const [videos, likedIds, followerCount, viewerIsFollowing] = await Promise.all([
    authorUserId ? getVideosByUserId(authorUserId) : getVideosByHandle(handle),
    viewerId ? getLikedVideoIdsForUser(viewerId) : Promise.resolve([]),
    authorUserId ? getFollowerCount(authorUserId) : Promise.resolve(0),
    authorUserId && viewerId ? isFollowing(viewerId, authorUserId) : Promise.resolve(false),
  ]);
  const likedSet = new Set(likedIds);
  const canMessage = Boolean(authorUserId && viewerId && authorUserId !== viewerId);

  return (
    <main className="relative h-screen w-full overflow-hidden bg-black">
      <header className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-center justify-between gap-3 px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            aria-label="Volver"
            className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <p className="text-base font-bold text-white">@{handle}</p>
        </div>
        <div className="pointer-events-auto flex items-center gap-2">
          {canMessage && (
            <Link
              href={`/mensajes/${authorUserId}`}
              aria-label="Enviar mensaje"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white"
            >
              <InboxIcon className="h-4 w-4" />
            </Link>
          )}
          {authorUserId && (
            <FollowButton
              targetUserId={authorUserId}
              initialFollowing={viewerIsFollowing}
              initialFollowerCount={followerCount}
            />
          )}
        </div>
      </header>

      {videos.length === 0 ? (
        <div className="flex h-screen w-full flex-col items-center justify-center gap-2 bg-black px-8 text-center text-white/60">
          <p className="text-lg font-semibold text-white">
            {authorUserId ? "Todavía no subió videos" : "No encontramos a este usuario"}
          </p>
          <p className="text-sm">Volvé al inicio para ver el resto del feed.</p>
        </div>
      ) : (
        <AppShell>
          <div className="no-scrollbar h-screen w-full snap-y snap-mandatory overflow-y-scroll bg-black">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} initialLiked={likedSet.has(video.id)} />
            ))}
          </div>
        </AppShell>
      )}
    </main>
  );
}
