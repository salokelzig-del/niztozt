import Link from "next/link";
import { ArrowLeftIcon } from "@/components/icons";
import ChannelSearch from "@/components/ChannelSearch";

export default function DescubrirPage() {
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
        <h1 className="text-lg font-bold">Descubrir canales</h1>
      </header>
      <ChannelSearch />
    </main>
  );
}
