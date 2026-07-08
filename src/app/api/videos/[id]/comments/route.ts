import { NextResponse } from "next/server";
import { addComment } from "@/lib/redis";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { user, text } = body;

  if (
    typeof user !== "string" ||
    !user.trim() ||
    typeof text !== "string" ||
    !text.trim()
  ) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const comment = await addComment(id, { user: user.trim(), text: text.trim() });
  return NextResponse.json(comment);
}
