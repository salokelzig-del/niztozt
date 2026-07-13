import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getMessages, getUserDisplayInfo, sendMessage } from "@/lib/redis";
import { getAuthedDisplayUser } from "@/lib/authUser";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId: viewerId } = await auth();
  if (!viewerId) {
    return NextResponse.json({ error: "Necesitás iniciar sesión" }, { status: 401 });
  }
  const { userId: partnerId } = await params;
  const messages = await getMessages(viewerId, partnerId);
  return NextResponse.json({ messages });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const authedUser = await getAuthedDisplayUser();
  if (!authedUser) {
    return NextResponse.json({ error: "Necesitás iniciar sesión" }, { status: 401 });
  }

  const { userId: partnerId } = await params;
  if (partnerId === authedUser.userId) {
    return NextResponse.json(
      { error: "No podés mandarte mensajes a vos mismo" },
      { status: 400 }
    );
  }

  const partner = await getUserDisplayInfo(partnerId);
  if (!partner) {
    return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
  }

  const body = await request.json();
  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text || text.length > 500) {
    return NextResponse.json({ error: "Mensaje inválido" }, { status: 400 });
  }

  const message = await sendMessage({
    fromId: authedUser.userId,
    fromName: authedUser.name,
    toId: partnerId,
    text,
  });
  return NextResponse.json(message);
}
