"use client";

import { useState, type ReactNode } from "react";
import BottomNav from "./BottomNav";
import UploadModal from "./UploadModal";

export default function AppShell({ children }: { children: ReactNode }) {
  const [uploadOpen, setUploadOpen] = useState(false);

  return (
    <>
      {children}
      <BottomNav onUploadClick={() => setUploadOpen(true)} />
      <UploadModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </>
  );
}
