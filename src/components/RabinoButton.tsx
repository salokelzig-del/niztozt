import Link from "next/link";
import { SparkChatIcon } from "./icons";

export default function RabinoButton() {
  return (
    <Link
      href="/rabino"
      aria-label="Guía Rega (asistente)"
      className="fixed right-4 bottom-24 z-30 flex h-12 w-12 items-center justify-center rounded-full border border-amber-300/40 bg-gradient-to-br from-amber-400 to-blue-600 text-black shadow-lg"
    >
      <SparkChatIcon className="h-6 w-6" />
    </Link>
  );
}
