export default function Loading() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-black">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/rega-icon.png" alt="Rega" className="h-20 w-20 rounded-2xl" />
      <span className="text-xl font-bold tracking-wide text-white">Rega</span>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-amber-400" />
    </div>
  );
}
