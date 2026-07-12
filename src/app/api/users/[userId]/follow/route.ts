import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { setFollowing } from "@/lib/redis";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId: viewerId } = await auth();
  if (!viewerId) {
    return NextResponse.json({ error: "Necesitás iniciar sesión" }, { status: 401 });
  }

  const { userId: targetUserId } = await params;
  if (viewerId === targetUserId) {
    return NextResponse.json({ error: "No podés seguirte a vos mismo" }, { status: 400 });
  }

  const body = await request.json();
  const followerCount = await setFollowing(viewerId, targetUserId, Boolean(body.following));
  return NextResponse.json({ followerCount });
}
