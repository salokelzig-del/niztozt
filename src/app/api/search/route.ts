import { NextResponse } from "next/server";
import { searchAuthors } from "@/lib/redis";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const authors = await searchAuthors(q);
  return NextResponse.json({ authors });
}
