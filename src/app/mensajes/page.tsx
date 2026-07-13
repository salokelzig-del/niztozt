import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getConversations } from "@/lib/redis";
import { ArrowLeftIcon } from "@/components/icons";
import SignInPromptButton from "@/components/SignInPromptButton";

export const dynamic = "force-dynamic";

function formatTime(ts: number): string {
  if (!ts) return "";
  const date = new Date(ts);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) {
    return date.toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" });
  }
  return date.toLocaleDateString("es", { day: "numeric", month: "short" });
}

export default async function MensajesPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <main className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-black px-8 text-center">
        <p className="text-lg font-semibold text-white">
          Iniciá sesión para ver tus mensajes
        </p>
        <SignInPromptButton label="Iniciar sesión" />
      </main>
    );
  }

  const conversations = await getConversations(userId);

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
        <h1 className="text-lg font-bold">Mensajes</h1>
      </header>

      {conversations.length === 0 ? (
        <div className="pt-16 text-center text-sm text-white/50">
          <p>Todavía no tenés conversaciones.</p>
          <p className="mt-1">
            Entrá al perfil de un canal y tocá el ícono de mensaje para empezar una.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {conversations.map((c) => (
            <li key={c.partnerId}>
              <Link
                href={`/mensajes/${c.partnerId}`}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-amber-400 bg-gradient-to-br from-blue-700 to-blue-950 text-sm font-bold text-white">
                  {c.partnerName.charAt(0)}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-white">
                    {c.partnerName}
                  </span>
                  <span className="block truncate text-xs text-white/50">
                    {c.lastMessage}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-white/40">
                  {formatTime(c.lastTs)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
