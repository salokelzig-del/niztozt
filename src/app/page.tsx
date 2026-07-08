import Feed from "@/components/Feed";
import BottomNav from "@/components/BottomNav";

export default function Home() {
  return (
    <main className="relative h-screen w-full overflow-hidden bg-black">
      <header className="pointer-events-none fixed inset-x-0 top-0 z-30 flex items-center justify-center gap-6 pt-[calc(env(safe-area-inset-top)+0.75rem)] pb-3 text-sm font-semibold">
        <span className="text-white/50">Siguiendo</span>
        <span className="border-b-2 border-amber-400 pb-1 text-white">Para ti</span>
      </header>
      <div className="pointer-events-none fixed left-4 top-[calc(env(safe-area-inset-top)+0.75rem)] z-30 flex items-center gap-1.5 text-amber-400">
        <span className="text-lg">✦</span>
        <span className="text-base font-bold tracking-wide text-white">
          Nitzotz
        </span>
      </div>
      <Feed />
      <BottomNav />
    </main>
  );
}
