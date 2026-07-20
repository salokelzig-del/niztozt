import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationsRead,
} from "@/lib/redis";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ notifications: [], unread: 0 });
  }
  const [notifications, unread] = await Promise.all([
    getNotifications(userId),
    getUnreadNotificationCount(userId),
  ]);
  return NextResponse.json({ notifications, unread });
}

export async function POST() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  await markNotificationsRead(userId);
  return NextResponse.json({ ok: true });
}
