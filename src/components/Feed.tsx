import { videos } from "@/data/videos";
import VideoCard from "./VideoCard";

export default function Feed() {
  return (
    <div className="no-scrollbar h-screen w-full snap-y snap-mandatory overflow-y-scroll bg-black">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}
