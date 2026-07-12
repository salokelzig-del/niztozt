import { Redis } from "@upstash/redis";
import type { Comment, Video } from "@/data/videos";
import { handleToSlug } from "./handle";

const redis = Redis.fromEnv();

const VIDEO_IDS_KEY = "nitzotz:video_ids";
const videoKey = (id: string) => `nitzotz:video:${id}`;
const commentsKey = (id: string) => `nitzotz:video:${id}:comments`;
const likedByUserKey = (userId: string) => `nitzotz:user:${userId}:liked`;
const userVideosKey = (userId: string) => `nitzotz:user:${userId}:videos`;
const handleOwnerKey = (handleSlug: string) => `nitzotz:handle:${handleSlug}`;

const GRADIENTS = [
  "from-blue-950 via-slate-900 to-amber-900",
  "from-amber-900 via-neutral-900 to-blue-950",
  "from-blue-900 via-slate-950 to-amber-800",
  "from-amber-800 via-neutral-950 to-blue-900",
  "from-blue-950 via-neutral-900 to-amber-700",
];

function pickGradient() {
  return GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)];
}

type StoredVideoMeta = {
  user: string;
  handle: string;
  description: string;
  hashtags: string[];
  music: string;
  gradient: string;
  category: string;
  videoUrl: string;
  likes: number;
  userId?: string;
};

async function hydrateVideos(ids: string[]): Promise<Video[]> {
  if (ids.length === 0) return [];

  const pipeline = redis.pipeline();
  for (const id of ids) {
    pipeline.hgetall(videoKey(id));
    pipeline.lrange(commentsKey(id), 0, -1);
  }
  const results = await pipeline.exec();

  const out: Video[] = [];
  for (let i = 0; i < ids.length; i++) {
    const meta = results[i * 2] as StoredVideoMeta | null;
    const comments = (results[i * 2 + 1] as Comment[]) || [];
    if (!meta) continue;
    out.push({
      id: ids[i],
      user: meta.user,
      handle: meta.handle,
      description: meta.description,
      hashtags: meta.hashtags || [],
      music: meta.music,
      gradient: meta.gradient,
      category: meta.category,
      videoUrl: meta.videoUrl || undefined,
      likes: Number(meta.likes || 0),
      comments,
    });
  }
  return out;
}

export async function getFeedVideos(): Promise<Video[]> {
  const ids = await redis.lrange<string>(VIDEO_IDS_KEY, 0, -1);
  return hydrateVideos(ids);
}

export async function getVideosByUserId(userId: string): Promise<Video[]> {
  const ids = await redis.lrange<string>(userVideosKey(userId), 0, -1);
  return hydrateVideos(ids);
}

export async function getUserIdByHandle(handleSlug: string): Promise<string | null> {
  return redis.get<string>(handleOwnerKey(handleSlug));
}

export async function seedVideo(video: Video): Promise<void> {
  const meta: StoredVideoMeta = {
    user: video.user,
    handle: video.handle,
    description: video.description,
    hashtags: video.hashtags,
    music: video.music,
    gradient: video.gradient,
    category: video.category,
    videoUrl: video.videoUrl || "",
    likes: video.likes,
  };
  await redis.hset(videoKey(video.id), meta);
  if (video.comments.length > 0) {
    await redis.rpush(commentsKey(video.id), ...video.comments);
  }
  await redis.rpush(VIDEO_IDS_KEY, video.id);
}

export async function createVideo(input: {
  userId: string;
  user: string;
  handle: string;
  description: string;
  hashtags: string[];
  category: string;
  videoUrl: string;
}): Promise<Video> {
  const id = crypto.randomUUID();
  const meta: StoredVideoMeta = {
    user: input.user,
    handle: input.handle,
    description: input.description,
    hashtags: input.hashtags,
    music: `Sonido original - ${input.user}`,
    gradient: pickGradient(),
    category: input.category,
    videoUrl: input.videoUrl,
    likes: 0,
    userId: input.userId,
  };
  await redis.hset(videoKey(id), meta);
  await redis.lpush(VIDEO_IDS_KEY, id);
  await redis.lpush(userVideosKey(input.userId), id);
  await redis.set(handleOwnerKey(handleToSlug(input.handle)), input.userId);
  return { id, ...meta, comments: [] };
}

export async function getLikedVideoIdsForUser(userId: string): Promise<string[]> {
  return redis.smembers(likedByUserKey(userId));
}

export async function setVideoLikedByUser(
  id: string,
  userId: string,
  liked: boolean
): Promise<number> {
  const alreadyLiked = await redis.sismember(likedByUserKey(userId), id);
  if (liked && !alreadyLiked) {
    await redis.sadd(likedByUserKey(userId), id);
    return redis.hincrby(videoKey(id), "likes", 1);
  }
  if (!liked && alreadyLiked) {
    await redis.srem(likedByUserKey(userId), id);
    return redis.hincrby(videoKey(id), "likes", -1);
  }
  const meta = await redis.hget<number>(videoKey(id), "likes");
  return meta || 0;
}

export async function addComment(
  id: string,
  input: { user: string; text: string }
): Promise<Comment> {
  const comment: Comment = {
    id: crypto.randomUUID(),
    user: input.user,
    text: input.text,
  };
  await redis.rpush(commentsKey(id), comment);
  return comment;
}
