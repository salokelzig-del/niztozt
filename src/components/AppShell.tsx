"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useClerk, useUser } from "@clerk/nextjs";
import BottomNav from "./BottomNav";
import UploadModal from "./UploadModal";

export default function AppShell({ children }: { children: ReactNode }) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { isSignedIn } = useUser();
  const clerk = useClerk();
  const router = useRouter();

  useEffect(() => {
    if (!isSignedIn) return;
    fetch("/api/profile/sync", { method: "POST" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setIsAdmin(Boolean(data.isAdmin));
        if (data.changed) router.refresh();
      })
      .catch(() => {});
  }, [isSignedIn, router]);

  function handleUploadClick() {
    if (isSignedIn) {
      setUploadOpen(true);
    } else {
      clerk.openSignIn({});
    }
  }

  return (
    <>
      {children}
      <BottomNav onUploadClick={handleUploadClick} isAdmin={isAdmin} />
      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </>
  );
}
