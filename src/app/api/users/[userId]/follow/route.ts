import { NextResponse } from "next/server";
import { addNotification, setFollowing } from "@/lib/redis";
import { getAuthedDisplayUser } from "@/lib/authUser";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const viewer = await getAuthedDisplayUser();
  if (!viewer) {
    return NextResponse.json({ error: "Necesitás iniciar sesión" }, { status: 401 });
  }

  const { userId: targetUserId } = await params;
  if (viewer.userId === targetUserId) {
    return NextResponse.json({ error: "No podés seguirte a vos mismo" }, { status: 400 });
  }

  const body = await request.json();
  const following = Boolean(body.following);
  const followerCount = await setFollowing(viewer.userId, targetUserId, following);

  if (following) {
    await addNotification(targetUserId, {
      type: "follow",
      fromName: viewer.name,
      fromHandle: viewer.handle,
    });
  }

  return NextResponse.json({ followerCount });
}
