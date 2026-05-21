import { safeSegment } from "@/lib/utils";

const READ_CHAPTERS_KEY = "komiku_read_chapters";

export function getReadChapters(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const value = window.localStorage.getItem(READ_CHAPTERS_KEY);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function markChapterAsRead(slug: string, chapter: string) {
  if (typeof window === "undefined") return;

  const key = chapterKey(slug, chapter);
  if (!key) return;

  const chapters = getReadChapters();
  if (chapters.includes(key)) return;

  window.localStorage.setItem(
    READ_CHAPTERS_KEY,
    JSON.stringify([...chapters, key])
  );
}

export function isChapterRead(slug: string, chapter: string) {
  const key = chapterKey(slug, chapter);
  return key ? getReadChapters().includes(key) : false;
}

export function resetReadChaptersForComic(slug: string) {
  if (typeof window === "undefined") return;

  const comicSlug = safeSegment(slug);
  if (!comicSlug) return;

  const filtered = getReadChapters().filter(
    (item) => !item.startsWith(`${comicSlug}/`)
  );
  window.localStorage.setItem(READ_CHAPTERS_KEY, JSON.stringify(filtered));
}

export function chapterKey(slug: string, chapter: string) {
  const comicSlug = safeSegment(slug);
  const chapterSlug = safeSegment(chapter);
  return comicSlug && chapterSlug ? `${comicSlug}/${chapterSlug}` : "";
}
