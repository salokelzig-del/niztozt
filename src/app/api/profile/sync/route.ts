import { NextResponse } from "next/server";
import { syncUserProfile } from "@/lib/redis";
import { getAuthedDisplayUser } from "@/lib/authUser";

export async function POST() {
  const authedUser = await getAuthedDisplayUser();
  if (!authedUser) {
    return NextResponse.json({ error: "Necesitás iniciar sesión" }, { status: 401 });
  }

  const { changed } = await syncUserProfile({
    userId: authedUser.userId,
    name: authedUser.name,
    handle: authedUser.handle,
  });

  return NextResponse.json({ changed, isAdmin: authedUser.isAdmin });
}
