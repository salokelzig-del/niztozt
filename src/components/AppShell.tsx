"use client";

import { useState, type ReactNode } from "react";
import { useClerk, useUser } from "@clerk/nextjs";
import BottomNav from "./BottomNav";
import UploadModal from "./UploadModal";

export default function AppShell({ children }: { children: ReactNode }) {
  const [uploadOpen, setUploadOpen] = useState(false);
  const { isSignedIn } = useUser();
  const clerk = useClerk();

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
      <BottomNav onUploadClick={handleUploadClick} />
      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </>
  );
}
