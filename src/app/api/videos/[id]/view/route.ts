import { NextResponse } from "next/server";
import { incrementVideoViews } from "@/lib/redis";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await incrementVideoViews(id);
  return NextResponse.json({ ok: true });
}
