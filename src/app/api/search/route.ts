import { NextResponse } from "next/server";
import { searchAuthors, searchVideos } from "@/lib/redis";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const [authors, videos] = await Promise.all([searchAuthors(q), searchVideos(q)]);
  return NextResponse.json({
    authors,
    videos: videos.map((v) => ({
      id: v.id,
      user: v.user,
      handle: v.handle,
      description: v.description,
      category: v.category,
      views: v.views || 0,
    })),
  });
}
