import { getFeedVideos } from "@/lib/redis";
import VideoCard from "./VideoCard";

export const dynamic = "force-dynamic";

export default async function Feed() {
  const videos = await getFeedVideos();

  if (videos.length === 0) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center gap-2 bg-black px-8 text-center text-white/60">
        <p className="text-lg font-semibold text-white">Todavía no hay videos</p>
        <p className="text-sm">Sé el primero en subir uno con el botón + de abajo.</p>
      </div>
    );
  }

  return (
    <div className="no-scrollbar h-screen w-full snap-y snap-mandatory overflow-y-scroll bg-black">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}
