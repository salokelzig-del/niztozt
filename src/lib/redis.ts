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
const followingKey = (userId: string) => `nitzotz:user:${userId}:following`;
const followersKey = (userId: string) => `nitzotz:user:${userId}:followers`;
const profileKey = (userId: string) => `nitzotz:user:${userId}:profile`;
const reportsKey = (id: string) => `nitzotz:video:${id}:reports`;
const REPORTED_VIDEOS_KEY = "nitzotz:reported_videos";

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
      userId: meta.userId,
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

export async function isFollowing(followerId: string, targetUserId: string): Promise<boolean> {
  return Boolean(await redis.sismember(followingKey(followerId), targetUserId));
}

export async function getFollowingIds(userId: string): Promise<string[]> {
  return redis.smembers(followingKey(userId));
}

export async function getFollowerCount(userId: string): Promise<number> {
  return redis.scard(followersKey(userId));
}

export async function setFollowing(
  followerId: string,
  targetUserId: string,
  follow: boolean
): Promise<number> {
  const already = await redis.sismember(followingKey(followerId), targetUserId);
  if (follow && !already) {
    await redis.sadd(followingKey(followerId), targetUserId);
    await redis.sadd(followersKey(targetUserId), followerId);
  } else if (!follow && already) {
    await redis.srem(followingKey(followerId), targetUserId);
    await redis.srem(followersKey(targetUserId), followerId);
  }
  return getFollowerCount(targetUserId);
}

export async function getFollowingFeedVideos(viewerUserId: string): Promise<Video[]> {
  const followingIds = new Set(await getFollowingIds(viewerUserId));
  if (followingIds.size === 0) return [];
  const all = await getFeedVideos();
  return all.filter((v) => v.userId && followingIds.has(v.userId));
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

export async function getVideoMeta(
  id: string
): Promise<{ userId?: string; videoUrl?: string } | null> {
  const meta = await redis.hgetall<{ userId?: string; videoUrl?: string }>(videoKey(id));
  return meta;
}

export async function deleteVideo(id: string): Promise<void> {
  const meta = await redis.hgetall<StoredVideoMeta>(videoKey(id));
  await redis.lrem(VIDEO_IDS_KEY, 0, id);
  await redis.del(videoKey(id));
  await redis.del(commentsKey(id));
  await redis.del(reportsKey(id));
  await redis.srem(REPORTED_VIDEOS_KEY, id);
  if (meta?.userId) {
    await redis.lrem(userVideosKey(meta.userId), 0, id);
  }
}

export async function reportVideo(id: string, reporterId: string): Promise<number> {
  await redis.sadd(reportsKey(id), reporterId);
  await redis.sadd(REPORTED_VIDEOS_KEY, id);
  return redis.scard(reportsKey(id));
}

export async function clearReports(id: string): Promise<void> {
  await redis.del(reportsKey(id));
  await redis.srem(REPORTED_VIDEOS_KEY, id);
}

export async function getReportedVideos(): Promise<
  { video: Video; reportCount: number }[]
> {
  const ids = await redis.smembers(REPORTED_VIDEOS_KEY);
  if (ids.length === 0) return [];
  const videos = await hydrateVideos(ids);
  const out: { video: Video; reportCount: number }[] = [];
  for (const video of videos) {
    const reportCount = await redis.scard(reportsKey(video.id));
    out.push({ video, reportCount });
  }
  return out;
}

export async function syncUserProfile(input: {
  userId: string;
  name: string;
  handle: string;
}): Promise<{ changed: boolean }> {
  const stored = await redis.hgetall<{ name: string; handle: string }>(
    profileKey(input.userId)
  );
  if (stored && stored.name === input.name && stored.handle === input.handle) {
    return { changed: false };
  }

  await redis.hset(profileKey(input.userId), {
    name: input.name,
    handle: input.handle,
  });

  const newSlug = handleToSlug(input.handle);
  if (stored?.handle) {
    const oldSlug = handleToSlug(stored.handle);
    if (oldSlug !== newSlug) {
      await redis.del(handleOwnerKey(oldSlug));
    }
  }
  await redis.set(handleOwnerKey(newSlug), input.userId);

  const videoIds = await redis.lrange<string>(userVideosKey(input.userId), 0, -1);
  for (const id of videoIds) {
    await redis.hset(videoKey(id), {
      user: input.name,
      handle: input.handle,
      music: `Sonido original - ${input.name}`,
    });
  }
  return { changed: true };
}
