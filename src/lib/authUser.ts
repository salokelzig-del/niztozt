import { currentUser } from "@clerk/nextjs/server";

export async function getAuthedDisplayUser(): Promise<{
  userId: string;
  name: string;
  handle: string;
} | null> {
  const user = await currentUser();
  if (!user) return null;

  const name =
    user.fullName ||
    user.username ||
    user.primaryEmailAddress?.emailAddress ||
    "Usuario";
  const handleBase = user.username || name;
  const handle = `@${handleBase.trim().toLowerCase().replace(/\s+/g, "_")}`;

  return { userId: user.id, name, handle };
}
