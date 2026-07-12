import Link from "next/link";
import { getReportedVideos } from "@/lib/redis";
import { getAuthedDisplayUser } from "@/lib/authUser";
import { ArrowLeftIcon } from "@/components/icons";
import ModerationActions from "@/components/ModerationActions";

export const dynamic = "force-dynamic";

export default async function ModeracionPage() {
  const authedUser = await getAuthedDisplayUser();

  if (!authedUser?.isAdmin) {
    return (
      <main className="flex h-screen w-full flex-col items-center justify-center gap-3 bg-black px-8 text-center">
        <p className="text-lg font-semibold text-white">Solo para administradores</p>
        <Link href="/" className="text-sm text-amber-400">
          Volver al inicio
        </Link>
      </main>
    );
  }

  const reported = await getReportedVideos();

  return (
    <main className="min-h-screen w-full bg-black px-4 pb-10 pt-[calc(env(safe-area-inset-top)+1rem)] text-white">
      <header className="mb-6 flex items-center gap-3">
        <Link
          href="/"
          aria-label="Volver"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-lg font-bold">Moderación</h1>
      </header>

      {reported.length === 0 ? (
        <p className="pt-16 text-center text-sm text-white/50">
          No hay videos reportados. Todo en orden ✦
        </p>
      ) : (
        <ul className="space-y-4">
          {reported.map(({ video, reportCount }) => (
            <li
              key={video.id}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-amber-300">{video.handle}</p>
                  <p className="mt-1 text-sm text-white/90">{video.description}</p>
                  <p className="mt-1 text-xs text-white/50">
                    Categoría: {video.category} · {reportCount}{" "}
                    {reportCount === 1 ? "reporte" : "reportes"}
                  </p>
                </div>
                {video.videoUrl && (
                  <video
                    src={video.videoUrl}
                    className="h-24 w-16 shrink-0 rounded-lg object-cover"
                    muted
                    playsInline
                  />
                )}
              </div>
              <ModerationActions videoId={video.id} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
