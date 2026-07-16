import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUnreadConversationCount } from "@/lib/redis";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ count: 0 });
  }
  const count = await getUnreadConversationCount(userId);
  return NextResponse.json({ count });
}
