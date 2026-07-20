import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeftIcon, SparkChatIcon } from "@/components/icons";
import SignInPromptButton from "@/components/SignInPromptButton";
import RabinoChat from "@/components/RabinoChat";

export const dynamic = "force-dynamic";

export default async function RabinoPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <main className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-black px-8 text-center">
        <SparkChatIcon className="h-12 w-12 text-amber-400" />
        <p className="text-lg font-semibold text-white">
          Iniciá sesión para hablar con la Guía Rega
        </p>
        <SignInPromptButton label="Iniciar sesión" />
      </main>
    );
  }

  return (
    <main className="flex h-screen w-full flex-col bg-black text-white">
      <header className="flex items-center gap-3 border-b border-white/10 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+1rem)]">
        <Link
          href="/"
          aria-label="Volver"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-2">
          <SparkChatIcon className="h-6 w-6 text-amber-400" />
          <div>
            <p className="text-sm font-bold leading-tight">Guía Rega</p>
            <p className="text-[11px] leading-tight text-white/50">Asistente educativo (IA)</p>
          </div>
        </div>
      </header>

      <div className="border-b border-amber-400/20 bg-amber-400/5 px-4 py-2">
        <p className="text-[11px] leading-snug text-amber-200/80">
          ⚠️ Soy una inteligencia artificial, no un rabino. Te doy información general para aprender;
          no doy dictámenes religiosos. Para decisiones personales, consultá a tu rabino.
        </p>
      </div>

      <div className="min-h-0 flex-1">
        <RabinoChat />
      </div>
    </main>
  );
}
