import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { NormalizedComic, PustakaSortOption } from "@/types/comic";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extract the manga slug from various API detail link formats.
 * e.g. "/detail-komik/bocchi-the-rock" => "bocchi-the-rock"
 * e.g. "https://komiku.org/manga/bocchi-the-rock/" => "bocchi-the-rock"
 */
export function extractSlugFromDetailLink(link?: string | null): string {
  if (!link) return "";
  const cleanLink = decodeURIComponent(String(link)).trim();
  const apiMatch = cleanLink.match(/\/detail-komik\/([^/?#]+)/);
  if (apiMatch?.[1]) return safeSegment(apiMatch[1]);
  const mangaMatch = cleanLink.match(/\/manga\/([^/?#]+)/);
  if (mangaMatch?.[1]) return safeSegment(mangaMatch[1]);
  const segments = cleanLink.split(/[/?#]/)[0]?.split("/").filter(Boolean) || [];
  return safeSegment(segments[segments.length - 1] || "");
}

/**
 * Extract chapter number/slug from various API chapter link formats.
 * e.g. "/baca-chapter/bocchi-the-rock/82" => "82"
 */
export function extractChapterFromApiLink(link?: string | null): string {
  if (!link) return "";
  const cleanLink = decodeURIComponent(String(link)).trim();
  const apiMatch = cleanLink.match(/\/baca-chapter\/[^/]+\/([^/?#]+)/);
  if (apiMatch?.[1]) return safeSegment(apiMatch[1]);
  const chapterMatch = cleanLink.match(/chapter-([\d.-]+)/i);
  if (chapterMatch?.[1]) return safeSegment(chapterMatch[1]);
  const segments = cleanLink.split(/[/?#]/)[0]?.split("/").filter(Boolean) || [];
  return safeSegment(segments[segments.length - 1] || "");
}

export function extractChapterFromText(text?: string | null): string {
  const match = String(text || "").match(/chapter\s*([\d]+(?:[.-][\d]+)?)/i);
  if (!match?.[1]) return "";
  return safeSegment(match[1].replace(".", "-"));
}

/**
 * Extract manga slug from a chapter API link.
 * e.g. "/baca-chapter/bocchi-the-rock/82" => "bocchi-the-rock"
 */
export function extractSlugFromChapterLink(link?: string | null): string {
  if (!link) return "";
  const cleanLink = decodeURIComponent(String(link)).trim();
  const apiMatch = cleanLink.match(/\/baca-chapter\/([^/]+)/);
  if (apiMatch?.[1]) return safeSegment(apiMatch[1]);
  const chapterMatch = cleanLink.match(/\/([^/?#]+)-chapter-[\d.]+/i);
  if (chapterMatch?.[1]) return safeSegment(chapterMatch[1]);
  return "";
}

export function safeSegment(value?: string | null): string {
  return String(value || "")
    .replace(/^\/+|\/+$/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .slice(0, 160);
}

export function textFallback(value?: string | null, fallback = "Tidak tersedia"): string {
  return String(value || "").trim() || fallback;
}

export function toArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

export function normalizeSearchText(value?: string | null): string {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function matchesComicSearch(comic: NormalizedComic, search?: string) {
  const keyword = normalizeSearchText(search);
  if (!keyword) return true;
  return normalizeSearchText(comic.title).includes(keyword);
}

export function matchesComicType(comic: NormalizedComic, type?: string) {
  const selected = normalizeSearchText(type);
  if (!selected || selected === "semua" || selected === "all") return true;
  return normalizeSearchText(comic.type).includes(selected);
}

export function matchesComicGenre(comic: NormalizedComic, genre?: string) {
  const selected = normalizeSearchText(genre);
  if (!selected || selected === "semua" || selected === "all") return true;
  const comicGenre = normalizeSearchText(comic.genre);
  const compactGenre = comicGenre.replace(/[^a-z0-9]+/g, "");
  const compactSelected = selected.replace(/[^a-z0-9]+/g, "");
  return comicGenre.includes(selected) || compactGenre.includes(compactSelected);
}

export function sortComics(
  comics: NormalizedComic[],
  sort: PustakaSortOption = "latest"
) {
  const sorted = [...comics];

  if (sort === "az") {
    return sorted.sort((a, b) => a.title.localeCompare(b.title, "id"));
  }

  if (sort === "za") {
    return sorted.sort((a, b) => b.title.localeCompare(a.title, "id"));
  }

  if (sort === "views") {
    return sorted.sort((a, b) => parseViews(b.views) - parseViews(a.views));
  }

  return sorted;
}

export function buildPustakaUrl({
  page = 1,
  search,
  type,
  genre,
  sort,
}: {
  page?: number;
  search?: string;
  type?: string;
  genre?: string;
  sort?: string;
}) {
  const params = new URLSearchParams();
  const trimmedSearch = String(search || "").trim();

  if (trimmedSearch) params.set("search", trimmedSearch);
  if (type && type !== "all") params.set("type", type);
  if (genre && genre !== "all") params.set("genre", genre);
  if (sort && sort !== "latest") params.set("sort", sort);
  params.set("page", String(Math.max(1, Number(page) || 1)));

  return `/pustaka?${params.toString()}`;
}

function parseViews(value?: string | null) {
  const raw = normalizeSearchText(value).replace(",", ".");
  const match = raw.match(/([\d.]+)/);
  if (!match?.[1]) return 0;

  const amount = Number.parseFloat(match[1]);
  if (!Number.isFinite(amount)) return 0;

  if (raw.includes("jt") || raw.includes("juta") || raw.includes("m")) {
    return amount * 1_000_000;
  }

  if (raw.includes("rb") || raw.includes("ribu") || raw.includes("k")) {
    return amount * 1_000;
  }

  return amount;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractLatestChapter(item: any, comicSlug?: string) {
  const rawTitle =
    item?.latestChapterTitle ||
    item?.chapterTitle ||
    item?.chapter ||
    item?.latestChapter?.chapter ||
    item?.latestChapter?.title ||
    item?.latestChapter ||
    item?.chapters?.latest?.chapter ||
    "";

  const apiLink =
    item?.apiChapterLink ||
    item?.latestChapterUrl ||
    item?.latestChapterLink ||
    item?.chapterUrl ||
    item?.chapterLink ||
    item?.latestChapter?.url ||
    item?.latestChapter?.apiLink ||
    item?.chapters?.latest?.apiLink ||
    item?.chapters?.latest?.link ||
    "";

  const slugFromLink = extractSlugFromChapterLink(apiLink);
  const chapter =
    extractChapterFromApiLink(apiLink) ||
    item?.chapterNumber ||
    item?.latestChapter?.chapterNumber ||
    extractChapterFromText(rawTitle);
  const slug = safeSegment(slugFromLink || comicSlug);
  const chapterLabel = String(rawTitle || "").match(/chapter\s*[\d]+(?:[.-][\d]+)?/i)?.[0];

  return {
    title: String(chapterLabel || (chapter ? `Chapter ${chapter.replace("-", ".")}` : rawTitle)).trim(),
    chapter: safeSegment(chapter),
    href: slug && chapter ? `/baca/${slug}/${safeSegment(chapter)}` : "",
  };
}

/**
 * Normalize varied comic item shapes from different endpoints
 * into a single NormalizedComic for consistent card rendering.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function normalizeComicItem(item: any): NormalizedComic {
  const slug =
    item?.slug ||
    item?.mangaSlug ||
    extractSlugFromDetailLink(
      item?.apiDetailLink ||
        item?.apiMangaLink ||
        item?.detailUrl ||
        item?.href ||
        item?.url ||
        item?.originalLink
    ) ||
    "";

  const thumbnail = item?.thumbnail || item?.image || item?.cover || "";
  const type = item?.type || item?.info?.["Jenis Komik"] || item?.["Jenis Komik"] || "";
  const genre = Array.isArray(item?.genres)
    ? item.genres.filter(Boolean).slice(0, 3).join(", ")
    : item?.genre || item?.genres || "";
  const latestChapter = extractLatestChapter(item, slug);

  const stats = item?.stats || "";
  const updateTime = item?.updateTime || item?.additionalInfo || stats || "";
  const views =
    item?.readers ||
    item?.views ||
    (/view|baca|read|pembaca/i.test(String(stats)) ? stats : "");
  const description = item?.description || item?.synopsis || "";

  return {
    title: item?.title || item?.name || "Judul tidak tersedia",
    slug: safeSegment(slug),
    thumbnail,
    type,
    genre,
    updateTime,
    latestChapterTitle: latestChapter.title,
    latestChapterSlug: latestChapter.chapter,
    latestChapterHref: latestChapter.href,
    isColored: item?.isColored ?? false,
    views,
    description,
  };
}
