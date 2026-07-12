import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getVideoMeta, reportVideo } from "@/lib/redis";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Necesitás iniciar sesión" }, { status: 401 });
  }

  const { id } = await params;
  const meta = await getVideoMeta(id);
  if (!meta) {
    return NextResponse.json({ error: "Video no encontrado" }, { status: 404 });
  }

  await reportVideo(id, userId);
  return NextResponse.json({ ok: true });
}
