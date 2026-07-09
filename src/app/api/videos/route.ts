import { NextResponse } from "next/server";
import { createVideo } from "@/lib/redis";
import { getAuthedDisplayUser } from "@/lib/authUser";

export async function POST(request: Request) {
  const authedUser = await getAuthedDisplayUser();
  if (!authedUser) {
    return NextResponse.json({ error: "Necesitás iniciar sesión" }, { status: 401 });
  }

  const body = await request.json();
  const { description, category, hashtags, videoUrl } = body;

  if (
    typeof description !== "string" ||
    !description.trim() ||
    typeof category !== "string" ||
    !category.trim() ||
    typeof videoUrl !== "string" ||
    !videoUrl
  ) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const video = await createVideo({
    user: authedUser.name,
    handle: authedUser.handle,
    description: description.trim(),
    category: category.trim(),
    hashtags: Array.isArray(hashtags)
      ? hashtags.filter((h): h is string => typeof h === "string")
      : [],
    videoUrl,
  });

  return NextResponse.json(video);
}
