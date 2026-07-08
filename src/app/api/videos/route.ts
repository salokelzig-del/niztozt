import { NextResponse } from "next/server";
import { createVideo } from "@/lib/redis";

export async function POST(request: Request) {
  const body = await request.json();
  const { user, description, category, hashtags, videoUrl } = body;

  if (
    typeof user !== "string" ||
    !user.trim() ||
    typeof description !== "string" ||
    !description.trim() ||
    typeof category !== "string" ||
    !category.trim() ||
    typeof videoUrl !== "string" ||
    !videoUrl
  ) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const handle = `@${user.trim().toLowerCase().replace(/\s+/g, "_")}`;

  const video = await createVideo({
    user: user.trim(),
    handle,
    description: description.trim(),
    category: category.trim(),
    hashtags: Array.isArray(hashtags)
      ? hashtags.filter((h): h is string => typeof h === "string")
      : [],
    videoUrl,
  });

  return NextResponse.json(video);
}
