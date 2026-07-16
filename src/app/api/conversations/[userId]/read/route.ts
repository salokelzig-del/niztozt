import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { markConversationRead } from "@/lib/redis";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId: viewerId } = await auth();
  if (!viewerId) {
    return NextResponse.json({ error: "Necesitas iniciar sesión" }, { status: 401 });
  }
  const { userId: partnerId } = await params;
  await markConversationRead(viewerId, partnerId);
  return NextResponse.json({ ok: true });
}
