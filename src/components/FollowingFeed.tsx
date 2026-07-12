import { auth } from "@clerk/nextjs/server";
import { getFollowingFeedVideos, getLikedVideoIdsForUser } from "@/lib/redis";
import VideoCard from "./VideoCard";
import SignInPromptButton from "./SignInPromptButton";

export const dynamic = "force-dynamic";

export default async function FollowingFeed() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-black px-8 text-center text-white/60">
        <p className="text-lg font-semibold text-white">Iniciá sesión para ver a quién seguís</p>
        <SignInPromptButton label="Iniciar sesión" />
      </div>
    );
  }

  const [videos, likedIds] = await Promise.all([
    getFollowingFeedVideos(userId),
    getLikedVideoIdsForUser(userId),
  ]);
  const likedSet = new Set(likedIds);

  if (videos.length === 0) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-2 bg-black px-8 text-center text-white/60">
        <p className="text-lg font-semibold text-white">Todavía no seguís a nadie</p>
        <p className="text-sm">
          Explorá el feed "Para ti" y tocá el nombre de un autor para seguirlo.
        </p>
      </div>
    );
  }

  return (
    <div className="no-scrollbar h-screen w-full snap-y snap-mandatory overflow-y-scroll bg-black">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} initialLiked={likedSet.has(video.id)} />
      ))}
    </div>
  );
}
