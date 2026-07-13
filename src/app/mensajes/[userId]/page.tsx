import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getMessages, getUserDisplayInfo } from "@/lib/redis";
import { handleToSlug } from "@/lib/handle";
import { ArrowLeftIcon } from "@/components/icons";
import SignInPromptButton from "@/components/SignInPromptButton";
import ChatView from "@/components/ChatView";

export const dynamic = "force-dynamic";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId: partnerId } = await params;
  const { userId: viewerId } = await auth();

  if (!viewerId) {
    return (
      <main className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-black px-8 text-center">
        <p className="text-lg font-semibold text-white">
          Iniciá sesión para ver tus mensajes
        </p>
        <SignInPromptButton label="Iniciar sesión" />
      </main>
    );
  }

  const partner = await getUserDisplayInfo(partnerId);

  if (!partner) {
    return (
      <main className="flex h-screen w-full flex-col items-center justify-center gap-3 bg-black px-8 text-center">
        <p className="text-lg font-semibold text-white">No encontramos a este usuario</p>
        <Link href="/mensajes" className="text-sm text-amber-400">
          Volver a mensajes
        </Link>
      </main>
    );
  }

  const messages = await getMessages(viewerId, partnerId);

  return (
    <main className="flex h-screen w-full flex-col bg-black text-white">
      <header className="flex items-center gap-3 border-b border-white/10 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+1rem)]">
        <Link
          href="/mensajes"
          aria-label="Volver"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <Link href={`/perfil/${handleToSlug(partner.handle)}`} className="min-w-0">
          <p className="truncate text-sm font-bold">{partner.name}</p>
          <p className="truncate text-xs text-amber-300">{partner.handle}</p>
        </Link>
      </header>
      <div className="min-h-0 flex-1">
        <ChatView partnerId={partnerId} selfId={viewerId} initialMessages={messages} />
      </div>
    </main>
  );
}
