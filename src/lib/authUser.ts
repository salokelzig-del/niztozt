import { currentUser } from "@clerk/nextjs/server";
import { deriveHandle } from "./handle";

export async function getAuthedDisplayUser(): Promise<{
  userId: string;
  name: string;
  handle: string;
  isAdmin: boolean;
} | null> {
  const user = await currentUser();
  if (!user) return null;

  const name =
    user.fullName ||
    user.username ||
    user.primaryEmailAddress?.emailAddress ||
    "Usuario";
  const handle = deriveHandle(name, user.username);

  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  const userEmails = user.emailAddresses.map((e) => e.emailAddress.toLowerCase());
  const isAdmin = userEmails.some((e) => adminEmails.includes(e));

  return { userId: user.id, name, handle, isAdmin };
}
