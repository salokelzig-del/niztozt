import { config } from "dotenv";
config({ path: ".env.local" });

import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();
const VIDEO_IDS_KEY = "nitzotz:video_ids";
const videoKey = (id: string) => `nitzotz:video:${id}`;
const commentsKey = (id: string) => `nitzotz:video:${id}:comments`;

async function main() {
  const ids = await redis.lrange<string>(VIDEO_IDS_KEY, 0, -1);
  for (const id of ids) {
    const meta = await redis.hgetall<{ user: string; category: string }>(videoKey(id));
    if (meta && (meta.user === "Claude Tester" || meta.category === "Prueba")) {
      await redis.lrem(VIDEO_IDS_KEY, 0, id);
      await redis.del(videoKey(id));
      await redis.del(commentsKey(id));
      console.log(`Eliminado video de prueba: ${id}`);
    }
  }
  console.log("Limpieza terminada.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
