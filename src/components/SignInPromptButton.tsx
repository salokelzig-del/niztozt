"use client";

import { useClerk } from "@clerk/nextjs";

export default function SignInPromptButton({ label }: { label: string }) {
  const clerk = useClerk();
  return (
    <button
      onClick={() => clerk.openSignIn({})}
      className="rounded-full bg-gradient-to-br from-amber-400 to-blue-600 px-5 py-2 text-sm font-semibold text-black"
    >
      {label}
    </button>
  );
}
