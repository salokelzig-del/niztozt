import { HomeIcon, InboxIcon, ProfileIcon, SearchIcon } from "./icons";

export default function BottomNav() {
  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-white/10 bg-black/40 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 backdrop-blur-sm">
      <div className="pointer-events-auto flex flex-col items-center gap-0.5 text-amber-400">
        <HomeIcon className="h-6 w-6" />
        <span className="text-[10px] font-medium">Inicio</span>
      </div>
      <div className="pointer-events-auto flex flex-col items-center gap-0.5 text-white/60">
        <SearchIcon className="h-6 w-6" />
        <span className="text-[10px] font-medium">Descubrir</span>
      </div>
      <div className="pointer-events-auto flex h-8 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-blue-600 text-xl font-bold text-black">
        +
      </div>
      <div className="pointer-events-auto flex flex-col items-center gap-0.5 text-white/60">
        <InboxIcon className="h-6 w-6" />
        <span className="text-[10px] font-medium">Bandeja</span>
      </div>
      <div className="pointer-events-auto flex flex-col items-center gap-0.5 text-white/60">
        <ProfileIcon className="h-6 w-6" />
        <span className="text-[10px] font-medium">Perfil</span>
      </div>
    </nav>
  );
}
