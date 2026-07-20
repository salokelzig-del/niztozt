import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getVideoById, getLikedVideoIdsForUser } from "@/lib/redis";
import { ArrowLeftIcon } from "@/components/icons";
import AppShell from "@/components/AppShell";
import VideoCard from "@/components/VideoCard";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const video = await getVideoById(id);
  if (!video) return { title: "Rega" };
  const title = `${video.user} en Rega`;
  return {
    title,
    description: video.description,
    openGraph: {
      title,
      description: video.description,
      images: ["/logo.png"],
    },
  };
}

export default async function VideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { userId: viewerId } = await auth();
  const [video, likedIds] = await Promise.all([
    getVideoById(id),
    viewerId ? getLikedVideoIdsForUser(viewerId) : Promise.resolve([]),
  ]);

  if (!video) {
    return (
      <main className="flex h-screen w-full flex-col items-center justify-center gap-3 bg-black px-8 text-center">
        <p className="text-lg font-semibold text-white">Este video ya no existe</p>
        <Link href="/" className="text-sm text-amber-400">
          Ir al inicio
        </Link>
      </main>
    );
  }

  return (
    <main className="relative h-screen w-full overflow-hidden bg-black">
      <div className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-center gap-3 px-4 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3">
        <Link
          href="/"
          aria-label="Volver"
          className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/rega-icon.png" alt="Rega" className="h-7 w-7 rounded-lg" />
        <span className="text-base font-bold tracking-wide text-white">Rega</span>
      </div>
      <AppShell>
        <div className="h-screen w-full bg-black">
          <VideoCard video={video} initialLiked={likedIds.includes(video.id)} />
        </div>
      </AppShell>
    </main>
  );
}
