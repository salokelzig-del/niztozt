import { NextResponse } from "next/server";
import { addComment } from "@/lib/redis";
import { getAuthedDisplayUser } from "@/lib/authUser";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authedUser = await getAuthedDisplayUser();
  if (!authedUser) {
    return NextResponse.json({ error: "Necesitás iniciar sesión" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { text } = body;

  if (typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const comment = await addComment(id, { user: authedUser.name, text: text.trim() });
  return NextResponse.json(comment);
}
