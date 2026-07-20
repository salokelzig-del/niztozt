import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getNotifications, markNotificationsRead } from "@/lib/redis";
import { handleToSlug } from "@/lib/handle";
import { ArrowLeftIcon } from "@/components/icons";
import SignInPromptButton from "@/components/SignInPromptButton";

export const dynamic = "force-dynamic";

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min} min`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  return `hace ${days} d`;
}

export default async function NotificacionesPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <main className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-black px-8 text-center">
        <p className="text-lg font-semibold text-white">
          Iniciá sesión para ver tus notificaciones
        </p>
        <SignInPromptButton label="Iniciar sesión" />
      </main>
    );
  }

  const notifications = await getNotifications(userId);
  await markNotificationsRead(userId);

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
        <h1 className="text-lg font-bold">Notificaciones</h1>
      </header>

      {notifications.length === 0 ? (
        <div className="pt-16 text-center text-sm text-white/50">
          <p>Todavía no tenés notificaciones.</p>
          <p className="mt-1">Cuando alguien te siga o comente tu video, aparecerá acá.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => {
            const inner = (
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-amber-400 bg-gradient-to-br from-blue-700 to-blue-950 text-sm font-bold text-white">
                  {n.fromName.charAt(0)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-white">
                    <span className="font-semibold">{n.fromName}</span>{" "}
                    {n.type === "follow"
                      ? "empezó a seguirte"
                      : "comentó tu video"}
                  </span>
                  {n.type === "comment" && n.text && (
                    <span className="block truncate text-xs text-white/50">“{n.text}”</span>
                  )}
                </span>
                <span className="shrink-0 text-xs text-white/40">{timeAgo(n.ts)}</span>
              </div>
            );
            if (n.type === "comment" && n.videoId) {
              return (
                <li key={n.id}>
                  <Link href={`/video/${n.videoId}`}>{inner}</Link>
                </li>
              );
            }
            return (
              <li key={n.id}>
                <Link href={`/perfil/${handleToSlug(n.fromHandle)}`}>{inner}</Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
