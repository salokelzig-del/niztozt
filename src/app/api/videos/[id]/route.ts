import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { deleteVideo, getVideoMeta } from "@/lib/redis";
import { getAuthedDisplayUser } from "@/lib/authUser";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authedUser = await getAuthedDisplayUser();
  if (!authedUser) {
    return NextResponse.json({ error: "Necesitás iniciar sesión" }, { status: 401 });
  }

  const { id } = await params;
  const meta = await getVideoMeta(id);
  if (!meta) {
    return NextResponse.json({ error: "Video no encontrado" }, { status: 404 });
  }

  const isOwner = meta.userId && meta.userId === authedUser.userId;
  if (!isOwner && !authedUser.isAdmin) {
    return NextResponse.json(
      { error: "Solo podés borrar tus propios videos" },
      { status: 403 }
    );
  }

  await deleteVideo(id);

  if (meta.videoUrl) {
    try {
      await del(meta.videoUrl);
    } catch {
      // Si el archivo ya no existe en Blob, el video igual quedó borrado del feed.
    }
  }

  return NextResponse.json({ ok: true });
}
