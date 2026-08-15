import { BookArt } from "./BookArt";

export function BookCover({ title, author, size = "md" }: { title: string; author: string; hue?: number; size?: "sm" | "md" | "lg" }) {
  const dims = size === "sm" ? "h-24 w-16" : size === "lg" ? "h-64 w-44" : "h-40 w-28";
  return (
    <div className={`relative shrink-0 overflow-hidden rounded-lg shadow-elevated ring-1 ring-black/20 ${dims}`}>
      <BookArt title={title} author={author} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-black/15" />
    </div>
  );
}

export function Avatar({ emoji, size = 56 }: { emoji: string; size?: number }) {
  return (
    <div
      className="flex items-center justify-center rounded-full bg-gradient-green shadow-glow"
      style={{ width: size, height: size, fontSize: size * 0.55 }}
    >
      <span>{emoji}</span>
    </div>
  );
}