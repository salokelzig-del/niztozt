"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Show, UserButton, useClerk, useUser } from "@clerk/nextjs";
import { deriveHandle, handleToSlug } from "@/lib/handle";
import {
  HomeIcon,
  InboxIcon,
  PlusIcon,
  ProfileIcon,
  SearchIcon,
  ShieldIcon,
} from "./icons";

export default function BottomNav({
  onUploadClick,
  isAdmin = false,
}: {
  onUploadClick: () => void;
  isAdmin?: boolean;
}) {
  const clerk = useClerk();
  const { user } = useUser();
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "/siguiendo";

  const ownHandle = user
    ? handleToSlug(
        deriveHandle(
          user.fullName || user.username || user.primaryEmailAddress?.emailAddress || "Usuario",
          user.username
        )
      )
    : null;

  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex items-center justify-around border-t border-white/10 bg-black/40 px-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] pt-2 backdrop-blur-sm">
      <Link
        href="/"
        className={`pointer-events-auto flex flex-col items-center gap-0.5 ${
          isHome ? "text-amber-400" : "text-white/60"
        }`}
      >
        <HomeIcon className="h-6 w-6" />
        <span className="text-[10px] font-medium">Inicio</span>
      </Link>
      <div className="pointer-events-auto flex flex-col items-center gap-0.5 text-white/60">
        <SearchIcon className="h-6 w-6" />
        <span className="text-[10px] font-medium">Descubrir</span>
      </div>
      <button
        onClick={onUploadClick}
        aria-label="Subir video"
        className="pointer-events-auto flex h-8 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-blue-600 text-black"
      >
        <PlusIcon className="h-5 w-5" />
      </button>
      <div className="pointer-events-auto flex flex-col items-center gap-0.5 text-white/60">
        <InboxIcon className="h-6 w-6" />
        <span className="text-[10px] font-medium">Bandeja</span>
      </div>
      <Show when="signed-in">
        <div className="pointer-events-auto flex flex-col items-center gap-0.5 text-white/60">
          <UserButton
            appearance={{
              elements: { userButtonAvatarBox: "h-6 w-6" },
            }}
          >
            <UserButton.MenuItems>
              <UserButton.Link
                label="Mis videos"
                href={ownHandle ? `/perfil/${ownHandle}` : "/"}
                labelIcon={<ProfileIcon className="h-4 w-4" />}
              />
              {isAdmin ? (
                <UserButton.Link
                  label="Moderación"
                  href="/moderacion"
                  labelIcon={<ShieldIcon className="h-4 w-4" />}
                />
              ) : null}
            </UserButton.MenuItems>
          </UserButton>
          <span className="text-[10px] font-medium">Perfil</span>
        </div>
      </Show>
      <Show when="signed-out">
        <button
          onClick={() => clerk.openSignIn({})}
          aria-label="Iniciar sesión"
          className="pointer-events-auto flex flex-col items-center gap-0.5 text-white/60"
        >
          <ProfileIcon className="h-6 w-6" />
          <span className="text-[10px] font-medium">Perfil</span>
        </button>
      </Show>
    </nav>
  );
}
