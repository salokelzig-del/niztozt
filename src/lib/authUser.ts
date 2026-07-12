import { currentUser } from "@clerk/nextjs/server";
import { deriveHandle } from "./handle";

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
  const handle = deriveHandle(name, user.username);

  return { userId: user.id, name, handle };
}
