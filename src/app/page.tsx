import Feed from "@/components/Feed";
import AppShell from "@/components/AppShell";
import FeedTabs from "@/components/FeedTabs";

export default function Home() {
  return (
    <main className="relative h-screen w-full overflow-hidden bg-black">
      <FeedTabs />
      <div className="pointer-events-none fixed left-4 top-[calc(env(safe-area-inset-top)+0.75rem)] z-30 flex items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/rega-icon.png" alt="Rega" className="h-7 w-7 rounded-lg" />
        <span className="text-base font-bold tracking-wide text-white">
          Rega
        </span>
      </div>
      <AppShell>
        <Feed />
      </AppShell>
    </main>
  );
}
