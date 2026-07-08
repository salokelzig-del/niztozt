import { NextResponse } from "next/server";
import { likeVideo } from "@/lib/redis";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const delta = body.liked ? 1 : -1;
  const likes = await likeVideo(id, delta);
  return NextResponse.json({ likes });
}
