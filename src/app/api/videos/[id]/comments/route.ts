import { NextResponse } from "next/server";
import { addComment, addNotification, getVideoById } from "@/lib/redis";
import { getAuthedDisplayUser } from "@/lib/authUser";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authedUser = await getAuthedDisplayUser();
  if (!authedUser) {
    return NextResponse.json({ error: "Necesitás iniciar sesión" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { text } = body;

  if (typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const trimmed = text.trim();
  const comment = await addComment(id, { user: authedUser.name, text: trimmed });

  const video = await getVideoById(id);
  if (video?.userId && video.userId !== authedUser.userId) {
    await addNotification(video.userId, {
      type: "comment",
      fromName: authedUser.name,
      fromHandle: authedUser.handle,
      videoId: id,
      text: trimmed,
    });
  }

  return NextResponse.json(comment);
}
