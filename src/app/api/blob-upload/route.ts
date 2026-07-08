import { issueSignedToken } from "@vercel/blob";
import { handleUploadPresigned } from "@vercel/blob/client";
import { NextResponse } from "next/server";

const MAX_VIDEO_BYTES = 200 * 1024 * 1024;

export async function POST(request: Request): Promise<NextResponse> {
  const body = await request.json();

  try {
    const jsonResponse = await handleUploadPresigned({
      body,
      request,
      getSignedToken: async (pathname) => {
        const token = await issueSignedToken({
          pathname,
          operations: ["put"],
          maximumSizeInBytes: MAX_VIDEO_BYTES,
          allowedContentTypes: ["video/mp4", "video/webm", "video/quicktime"],
          validUntil: Date.now() + 60 * 60 * 1000,
        });
        return { token };
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error al subir" },
      { status: 400 }
    );
  }
}
