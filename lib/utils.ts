import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type {
  ChapterItem,
  ComicDetail,
  DoujindesuChapter,
  DoujindesuDetail,
  DoujindesuListItem,
  DoujindesuReader,
  NormalizedComic,
  PustakaSortOption,
  ReaderControlChapter,
} from "@/types/comic";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Extract the manga slug from various API detail link formats.
 * e.g. "/detail-komik/bocchi-the-rock" => "bocchi-the-rock"
 * e.g. "https://komiku.org/manga/bocchi-the-rock/" => "bocchi-the-rock"
 */
export function extractSlugFromDetailLink(link?: string | null): string {
  return extractDoujindesuSlug(link);
}

export function extractSlugFromUrl(url?: string | null): string {
  return extractDoujindesuSlug(url);
}

export function extractDoujindesuSlug(urlOrSlug?: string | null): string {
  if (!urlOrSlug) return "";
  const cleanValue = decodeURIComponent(String(urlOrSlug)).trim();
  const apiDetailMatch = cleanValue.match(/\/api\/detail\/([^/?#]+)/);
  if (apiDetailMatch?.[1]) return safeSegment(apiDetailMatch[1]);
  const apiChapterMatch = cleanValue.match(/\/api\/chapter\/([^/?#]+)/);
  if (apiChapterMatch?.[1]) return safeSegment(apiChapterMatch[1]);
  const legacyDetailMatch = cleanValue.match(/\/detail-komik\/([^/?#]+)/);
  if (legacyDetailMatch?.[1]) return safeSegment(legacyDetailMatch[1]);
  const legacyChapterMatch = cleanValue.match(/\/baca-chapter\/[^/]+\/([^/?#]+)/);
  if (legacyChapterMatch?.[1]) return safeSegment(legacyChapterMatch[1]);

  const withoutDomain = cleanValue.replace(/^https?:\/\/(?:www\.)?[^/]+/i, "");
  const segments = withoutDomain.split(/[?#]/)[0]?.split("/").filter(Boolean) || [];
  return safeSegment(segments[0] || cleanValue);
}

export function extractKomikuSlugFromDetailLink(link?: string | null): string {
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
  const doujinMatch = cleanLink.match(/\/api\/chapter\/([^/?#]+)/);
  if (doujinMatch?.[1]) return safeSegment(doujinMatch[1]);
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
  const doujinMatch = cleanLink.match(/\/api\/chapter\/([^/?#]+)/);
  if (doujinMatch?.[1]) return safeSegment(doujinMatch[1]);
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

  const query = params.toString();
  return query ? `/pustaka?${query}` : "/pustaka";
}

export function normalizeReaderChapters(
  chapters: ChapterItem[],
  slug: string
): ReaderControlChapter[] {
  const normalizedSlug = safeSegment(slug);
  const seen = new Set<string>();

  return chapters
    .map((chapter, index) => {
      const chapterSlug = safeSegment(
        chapter.chapterNumber || extractChapterFromApiLink(chapter.apiLink)
      );

      if (!chapterSlug || seen.has(chapterSlug)) return null;
      seen.add(chapterSlug);

      return {
        title: chapter.title || `Chapter ${chapterSlug || index + 1}`,
        chapterSlug,
        href: `/baca/${normalizedSlug}/${chapterSlug}`,
      };
    })
    .filter((chapter): chapter is ReaderControlChapter => Boolean(chapter));
}

export function normalizeDoujindesuComicItem(item: DoujindesuListItem): NormalizedComic {
  const record = item as DoujindesuListItem & {
    thumbnail?: string;
    image?: string;
    genre?: string;
    genres?: string[];
    chapterSlug?: string;
    latestChapterSlug?: string;
    chapterUrl?: string;
    latestChapterUrl?: string;
    updatedAt?: string;
    uploaded?: string;
    latestChapter?: string | { title?: string; slug?: string; url?: string; chapter?: string };
    chapter?: string | { title?: string; slug?: string; url?: string; chapter?: string };
  };
  const latestChapterRecord =
    typeof record.latestChapter === "object" && record.latestChapter
      ? record.latestChapter
      : ({} as { title?: string; slug?: string; url?: string; chapter?: string });
  const chapterRecord =
    typeof record.chapter === "object" && record.chapter
      ? record.chapter
      : ({} as { title?: string; slug?: string; url?: string; chapter?: string });
  const slug = extractDoujindesuSlug(item.slug) || extractDoujindesuSlug(item.url);
  const cover = String(record.cover || record.thumbnail || record.image || "").trim();
  const latestTitle = String(
    latestChapterRecord.title ||
      latestChapterRecord.chapter ||
      chapterRecord.title ||
      chapterRecord.chapter ||
      (typeof item.latestChapter === "string" ? item.latestChapter : "") ||
      (typeof item.chapter === "string" ? item.chapter : "")
  ).trim();
  const chapterSlug =
    extractDoujindesuSlug(record.latestChapterSlug) ||
    extractDoujindesuSlug(record.chapterSlug) ||
    extractDoujindesuSlug(latestChapterRecord.slug) ||
    extractDoujindesuSlug(chapterRecord.slug) ||
    extractDoujindesuSlug(record.latestChapterUrl) ||
    extractDoujindesuSlug(record.chapterUrl) ||
    extractDoujindesuSlug(latestChapterRecord.url) ||
    extractDoujindesuSlug(chapterRecord.url) ||
    (typeof item.chapter === "string" ? slugFromChapterText(item.chapter) : "") ||
    (typeof item.latestChapter === "string" ? slugFromChapterText(item.latestChapter) : "");
  const genres = Array.isArray(record.genres) ? record.genres.filter(Boolean) : [];
  const genre = genres.slice(0, 3).join(", ") || record.genre || "";

  return {
    slug,
    title: String(item.title || "Judul tidak tersedia").trim(),
    thumbnail: cover,
    cover,
    type: item.type || "",
    genre,
    genres,
    rating: item.rating,
    latestChapterTitle: latestTitle,
    latestChapterSlug: chapterSlug,
    latestChapterHref: chapterSlug ? `/baca/${slug}/${chapterSlug}` : "",
    latestChapter: latestTitle || chapterSlug
      ? {
          title: latestTitle || chapterSlug,
          chapterSlug,
        }
      : undefined,
    updatedAt: record.updatedAt || record.uploaded,
  };
}

export const normalizeDoujindesuItem = normalizeDoujindesuComicItem;

export function normalizeDoujindesuChapter(item: DoujindesuChapter): ChapterItem {
  const chapterSlug =
    extractDoujindesuSlug(item.slug) ||
    extractDoujindesuSlug(item.url) ||
    slugFromChapterText(item.chapter) ||
    slugFromChapterText(item.title);
  const title = String(item.title || item.chapter || chapterSlug || "Chapter").trim();

  return {
    title,
    originalLink: item.url,
    apiLink: chapterSlug ? `/api/chapter/${chapterSlug}` : "",
    date: item.uploaded,
    chapterNumber: chapterSlug,
  };
}

export function normalizeDoujindesuDetail(data: DoujindesuDetail): ComicDetail {
  const chapters = toArray(data.chapters).map(normalizeDoujindesuChapter);
  const record = data as DoujindesuDetail & { thumbnail?: string; sinopsis?: string; synopsis?: string };
  const thumbnail = String(data.cover || record.thumbnail || "").trim();
  const info = {
    "Judul Komik": data.title,
    "Judul Alternatif": data.alternativeTitle,
    "Jenis Komik": data.type,
    "Rating": data.rating,
    "Status": data.status,
    "Pengarang": data.author,
    "Artist": data.artist,
  };

  return {
    title: data.title,
    alternativeTitle: data.alternativeTitle,
    description: data.description || record.sinopsis || record.synopsis,
    sinopsis: data.description || record.sinopsis || record.synopsis,
    thumbnail,
    info,
    genres: [...toArray(data.genres), ...toArray(data.tags)].filter(Boolean),
    firstChapter: chapters[chapters.length - 1],
    latestChapter: chapters[0],
    chapters,
    similarKomik: [],
  };
}

export function normalizeReaderImages(images: DoujindesuReader["images"] | unknown): {
  src?: string;
  alt?: string;
  id?: string;
  fallbackSrc?: string;
}[] {
  if (!Array.isArray(images)) return [];

  return images
    .map((image, index) => {
      if (typeof image === "string") {
        return {
          src: image,
          alt: `Halaman ${index + 1}`,
          id: String(index + 1),
          fallbackSrc: image,
        };
      }

      if (image && typeof image === "object") {
        const item = image as { src?: string; url?: string; image?: string; alt?: string; id?: string };
        const src = item.src || item.url || item.image || "";
        return {
          src,
          alt: item.alt || `Halaman ${index + 1}`,
          id: item.id || String(index + 1),
          fallbackSrc: src,
        };
      }

      return null;
    })
    .filter((image): image is { src: string; alt: string; id: string; fallbackSrc: string } =>
      Boolean(image?.src)
    );
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
    item?.chapterSlug ||
    item?.chapterNumber ||
    item?.latestChapter?.chapterNumber ||
    slugFromChapterText(item?.chapter) ||
    extractChapterFromText(rawTitle) ||
    slugFromChapterText(rawTitle);
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
    cover: item?.cover || thumbnail,
    type,
    genre,
    genres: Array.isArray(item?.genres) ? item.genres.filter(Boolean) : genre ? [genre] : [],
    updateTime,
    updatedAt: item?.updatedAt || updateTime,
    rating: item?.rating,
    latestChapterTitle: latestChapter.title,
    latestChapterSlug: latestChapter.chapter,
    latestChapterHref: latestChapter.href,
    latestChapter: latestChapter.title || latestChapter.chapter
      ? {
          title: latestChapter.title,
          chapterSlug: latestChapter.chapter,
        }
      : undefined,
    isColored: item?.isColored ?? false,
    views,
    description,
  };
}

function slugFromChapterText(value?: string | null): string {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw) || raw.startsWith("/")) {
    return extractSlugFromUrl(raw);
  }
  if (/^[a-z0-9][a-z0-9._-]+$/i.test(raw) && raw.includes("-")) {
    return safeSegment(raw);
  }
  return "";
}
