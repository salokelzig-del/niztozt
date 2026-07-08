import { config } from "dotenv";
config({ path: ".env.local" });

import { Redis } from "@upstash/redis";
import { SEED_VIDEOS } from "../src/data/videos.ts";

const redis = Redis.fromEnv();

const VIDEO_IDS_KEY = "nitzotz:video_ids";
const videoKey = (id: string) => `nitzotz:video:${id}`;
const commentsKey = (id: string) => `nitzotz:video:${id}:comments`;

async function main() {
  const existing = await redis.lrange<string>(VIDEO_IDS_KEY, 0, -1);
  if (existing.length > 0) {
    console.log(
      `Ya hay ${existing.length} videos en la base de datos. No se vuelve a sembrar.`
    );
    return;
  }

  for (const video of SEED_VIDEOS) {
    const { id, comments, likes, ...meta } = video;
    await redis.hset(videoKey(id), { ...meta, likes });
    if (comments.length > 0) {
      await redis.rpush(commentsKey(id), ...comments);
    }
    await redis.rpush(VIDEO_IDS_KEY, id);
    console.log(`Sembrado: ${video.user} (${id})`);
  }

  console.log(`Listo. ${SEED_VIDEOS.length} videos cargados en Redis.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
