const USERNAME_KEY = "nitzotz:username";
const LIKED_KEY = "nitzotz:liked_videos";

export function getLocalUserName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(USERNAME_KEY) || "";
}

export function setLocalUserName(name: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(USERNAME_KEY, name);
}

export function getLikedVideoIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(LIKED_KEY) || "[]");
  } catch {
    return [];
  }
}

export function setVideoLiked(id: string, liked: boolean) {
  if (typeof window === "undefined") return;
  const current = new Set(getLikedVideoIds());
  if (liked) {
    current.add(id);
  } else {
    current.delete(id);
  }
  localStorage.setItem(LIKED_KEY, JSON.stringify([...current]));
}
