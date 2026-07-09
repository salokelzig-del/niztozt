import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { setVideoLikedByUser } from "@/lib/redis";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Necesitás iniciar sesión" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const likes = await setVideoLikedByUser(id, userId, Boolean(body.liked));
  return NextResponse.json({ likes });
}
