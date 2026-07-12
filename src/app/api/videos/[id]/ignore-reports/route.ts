import { NextResponse } from "next/server";
import { clearReports } from "@/lib/redis";
import { getAuthedDisplayUser } from "@/lib/authUser";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authedUser = await getAuthedDisplayUser();
  if (!authedUser?.isAdmin) {
    return NextResponse.json({ error: "Solo para administradores" }, { status: 403 });
  }

  const { id } = await params;
  await clearReports(id);
  return NextResponse.json({ ok: true });
}
