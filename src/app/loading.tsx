export default function Loading() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 bg-black">
      <div className="flex items-center gap-1.5 text-amber-400">
        <span className="text-2xl">✦</span>
        <span className="text-xl font-bold tracking-wide text-white">Nitzotz</span>
      </div>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-amber-400" />
    </div>
  );
}
