export function deriveHandle(name: string, username?: string | null): string {
  const base = username || name;
  return `@${base.trim().toLowerCase().replace(/\s+/g, "_")}`;
}

export function handleToSlug(handle: string): string {
  return handle.replace(/^@/, "");
}
