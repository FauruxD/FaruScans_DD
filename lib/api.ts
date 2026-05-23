import type {
  ApiResult,
  ChapterDetail,
  ComicDetail,
  DoujindesuDetail,
  DoujindesuListItem,
  DoujindesuReader,
  GenreAllItem,
  GenreDetailResponse,
  HomeResponse,
  NormalizedComic,
  PopulerResponse,
  PustakaResponse,
  SearchResponse,
} from "@/types/comic";
import {
  extractDoujindesuSlug,
  normalizeDoujindesuDetail,
  normalizeDoujindesuItem,
  normalizeReaderImages,
  safeSegment,
} from "@/lib/utils";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://doujindesu-rest-api.vercel.app";

type UnknownRecord = Record<string, unknown>;
type LibraryType = "doujin" | "manga" | "manhwa";

function joinUrl(endpoint: string) {
  return `${BASE_URL.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;
}

async function fetcher<T>(endpoint: string, revalidate = 300): Promise<T> {
  const res = await fetch(joinUrl(endpoint), {
    next: { revalidate },
  });

  if (!res.ok) {
    let detail = "";
    try {
      const json = await res.json();
      detail = json?.message || json?.error || json?.detail || "";
    } catch {
      detail = res.statusText;
    }
    throw new Error(detail || `API merespons ${res.status}`);
  }

  return res.json() as Promise<T>;
}

async function safeApi<T>(
  request: () => Promise<T>,
  fallback: T
): Promise<ApiResult<T>> {
  try {
    const data = await request();
    return { data, error: null };
  } catch (error) {
    return {
      data: fallback,
      error: error instanceof Error ? error.message : "Gagal mengambil data.",
    };
  }
}

export async function fetchDoujinList() {
  return fetchComicList("/api/doujin", "Doujin");
}

export async function fetchMangaList() {
  return fetchComicList("/api/manga", "Manga");
}

export async function fetchManhwaList() {
  return fetchComicList("/api/manhwa", "Manhwa");
}

export async function fetchAllLibrary() {
  return safeApi<NormalizedComic[]>(async () => {
    const [doujin, manga, manhwa] = await Promise.all([
      fetchDoujinList(),
      fetchMangaList(),
      fetchManhwaList(),
    ]);

    return dedupeComics([
      ...doujin.data,
      ...manga.data,
      ...manhwa.data,
    ]);
  }, []);
}

export async function fetchGenres() {
  return safeApi<GenreAllItem[]>(
    async () => normalizeGenres(await fetcher<unknown>("/api/genres", 3600)),
    []
  );
}

export async function fetchGenreDetail(slug: string) {
  const normalizedSlug = extractDoujindesuSlug(slug);

  return safeApi<GenreDetailResponse>(
    async () =>
      listToGenreDetail(
        await fetcher<unknown>(`/api/genre/${normalizedSlug}`, 300)
      ),
    { success: false, currentPage: 1, data: [], hasNextPage: false }
  );
}

export async function fetchComicDetail(slug: string) {
  const normalizedSlug = extractDoujindesuSlug(slug);

  return safeApi<ComicDetail | null>(
    async () =>
      normalizeDoujindesuDetail(
        unwrapData(await fetcher<unknown>(`/api/detail/${normalizedSlug}`, 300)) as DoujindesuDetail
      ),
    null
  );
}

export async function fetchChapter(chapterSlug: string) {
  const normalizedSlug = extractDoujindesuSlug(chapterSlug);

  return safeApi<ChapterDetail | null>(
    async () =>
      normalizeDoujindesuReader(
        unwrapData(await fetcher<unknown>(`/api/chapter/${normalizedSlug}`, 600))
      ),
    null
  );
}

export async function searchComics(query: string) {
  const keyword = String(query || "").trim();

  return safeApi<SearchResponse>(
    async () => {
      if (!keyword) return { status: true, data: [], total: 0 };
      const data = normalizeComicList(
        await fetcher<unknown>(`/api/search?q=${encodeURIComponent(keyword)}`, 60)
      );
      return { status: true, keyword, data, total: data.length };
    },
    { status: false, data: [], total: 0 }
  );
}

export async function fetchPopular() {
  return safeApi<NormalizedComic[]>(async () => {
    try {
      const popular = normalizeComicList(await fetcher<unknown>("/api/popular", 300));
      if (popular.length) return popular;
    } catch {
      // Popular is optional for this API. Fall back to the category catalog.
    }

    const library = await fetchAllLibrary();
    return library.data;
  }, []);
}

export async function fetchHome() {
  return safeApi<HomeResponse>(async () => {
    let home: UnknownRecord = {};

    try {
      home = asRecord(unwrapData(await fetcher<unknown>("/api/home", 120)));
    } catch {
      home = {};
    }

    const recommended = normalizeComicList(
      pickField(home, ["recommended", "recommendation", "rekomendasi", "manga"])
    );

    return {
      latest: normalizeComicList(pickField(home, ["latest", "manhwa"])),
      popular: normalizePopularResponse(pickField(home, ["popular", "doujin"])),
      recommended,
      genres: normalizeGenres(pickField(home, ["genres", "genre"])),
    };
  }, emptyHome());
}

// Backward-compatible exports used by existing FaruScan pages/components.
export const fetchAllGenres = fetchGenres;
export const fetchGenreComics = fetchGenreDetail;
export const fetchPopularComics = async () =>
  safeApi<PopulerResponse>(
    async () => normalizePopularResponse((await fetchPopular()).data),
    {}
  );
export const fetchRecommendations = fetchMangaList;
export const fetchRecommendedGenres = fetchGenres;
export const fetchLatestComics = fetchManhwaList;
export const fetchDoujin = async () => listResultToPustaka(await fetchDoujinList());
export const fetchColoredComics = fetchDoujin;
export const fetchLibrary = async () => listResultToPustaka(await fetchAllLibrary());
export const fetchLibraryComics = fetchLibrary;
export async function fetchByType(type: LibraryType) {
  if (type === "doujin") return listResultToPustaka(await fetchDoujinList());
  if (type === "manhwa") return listResultToPustaka(await fetchManhwaList());
  return listResultToPustaka(await fetchMangaList());
}
export async function fetchChapterDetail(_comicSlug: string, chapterSlug: string) {
  return fetchChapter(chapterSlug);
}

function fetchComicList(endpoint: string, fallbackType: string) {
  return safeApi<NormalizedComic[]>(
    async () =>
      normalizeComicList(await fetcher<unknown>(endpoint, 300)).map((comic) => ({
        ...comic,
        type: comic.type || fallbackType,
      })),
    []
  );
}

function normalizeDoujindesuReader(raw: unknown): ChapterDetail {
  const reader = asRecord(raw) as DoujindesuReader & UnknownRecord;
  const chapterSlug =
    extractDoujindesuSlug(reader.chapter as string | undefined) ||
    extractDoujindesuSlug(reader.slug as string | undefined) ||
    extractDoujindesuSlug(reader.url as string | undefined);
  const prevChapter = normalizeReaderNav(reader.prevChapter);
  const nextChapter = normalizeReaderNav(reader.nextChapter);
  const images = normalizeReaderImages(reader.images);

  return {
    title: String(reader.title || reader.chapter || chapterSlug || "Chapter").trim(),
    mangaInfo: normalizeReaderMangaInfo(reader),
    images,
    meta: {
      chapterNumber: chapterSlug,
      totalImages: images.length,
      slug: chapterSlug,
    },
    navigation: {
      prevChapter,
      nextChapter,
    },
  };
}

function normalizeReaderMangaInfo(reader: DoujindesuReader & UnknownRecord) {
  const comic = firstRecord(reader.comic, reader.manga, reader.detail, reader.series);
  const slug =
    extractDoujindesuSlug(comic.slug as string | undefined) ||
    extractDoujindesuSlug(comic.url as string | undefined) ||
    extractDoujindesuSlug(reader.detailUrl as string | undefined) ||
    "";

  return {
    title: String(comic.title || reader.comicTitle || reader.mangaTitle || "").trim(),
    originalLink: String(comic.url || reader.detailUrl || ""),
    apiLink: slug ? `/api/detail/${slug}` : undefined,
    slug,
  };
}

function normalizeReaderNav(value: unknown) {
  const item = asRecord(value);
  if (!item) return null;

  const slug =
    extractDoujindesuSlug(item.slug as string | undefined) ||
    extractDoujindesuSlug(item.url as string | undefined);
  if (!slug) return null;

  return {
    title: String(item.title || slug).trim(),
    originalLink: String(item.url || ""),
    apiLink: `/api/chapter/${slug}`,
    chapter: slug,
    chapterNumber: slug,
    slug,
  };
}

function normalizeComicList(raw: unknown): NormalizedComic[] {
  return extractList(raw)
    .map((item) => normalizeDoujindesuItem(item as DoujindesuListItem))
    .filter((item) => item.slug);
}

function normalizeGenres(raw: unknown): GenreAllItem[] {
  return extractList(raw)
    .map((item) => {
      if (typeof item === "string") {
        const slug = extractDoujindesuSlug(item.toLowerCase().replace(/\s+/g, "-"));
        return { title: item, slug, apiGenreLink: `/api/genre/${slug}` };
      }

      const record = asRecord(item);
      const title = String(record.title || record.name || record.genre || record.slug || "").trim();
      const slug =
        extractDoujindesuSlug(record.slug as string | undefined) ||
        extractDoujindesuSlug(record.url as string | undefined) ||
        extractDoujindesuSlug(title.toLowerCase().replace(/\s+/g, "-"));

      return {
        title: title || slug,
        slug,
        apiGenreLink: slug ? `/api/genre/${slug}` : undefined,
      };
    })
    .filter((item) => item.slug);
}

function normalizePopularResponse(raw: unknown): PopulerResponse {
  const items = normalizeComicList(raw);

  return {
    manga: {
      title: "Manga",
      items: items.filter((item) => isType(item, "manga")).map(toPopulerItem),
    },
    manhwa: {
      title: "Manhwa",
      items: items.filter((item) => isType(item, "manhwa")).map(toPopulerItem),
    },
    manhua: {
      title: "Doujin",
      items: items
        .filter((item) => isType(item, "doujin") || isType(item, "doujinshi"))
        .map(toPopulerItem),
    },
  };
}

function listToGenreDetail(raw: unknown): GenreDetailResponse {
  const data = normalizeComicList(raw).map((item) => ({
    title: item.title,
    slug: item.slug,
    type: item.type,
    genre: item.genre || item.genres?.join(", "),
    thumbnail: item.thumbnail,
    description: item.description,
    additionalInfo: item.updatedAt,
    apiMangaLink: `/api/detail/${item.slug}`,
    chapters: item.latestChapterSlug
      ? {
          latest: {
            chapter: item.latestChapterTitle,
            apiLink: `/api/chapter/${item.latestChapterSlug}`,
          },
        }
      : undefined,
  }));

  return {
    success: true,
    currentPage: 1,
    hasNextPage: false,
    data,
  };
}

function listResultToPustaka(result: ApiResult<NormalizedComic[]>): ApiResult<PustakaResponse> {
  return {
    data: {
      page: 1,
      results: result.data.map(toPustakaItem),
      hasNextPage: false,
    },
    error: result.error,
  };
}

function toPustakaItem(item: NormalizedComic) {
  return {
    title: item.title,
    thumbnail: item.thumbnail || item.cover,
    type: item.type,
    genre: item.genre || item.genres?.join(", "),
    url: `/komik/${item.slug}`,
    detailUrl: `/api/detail/${item.slug}`,
    description: item.description,
    stats: item.updatedAt || item.rating,
    latestChapter: item.latestChapterSlug
      ? {
          title: item.latestChapterTitle,
          url: `/api/chapter/${item.latestChapterSlug}`,
        }
      : undefined,
  };
}

function toPopulerItem(item: NormalizedComic) {
  return {
    title: item.title,
    apiDetailLink: `/api/detail/${item.slug}`,
    thumbnail: item.thumbnail || item.cover,
    genre: item.genre || item.genres?.join(", "),
    latestChapter: item.latestChapterTitle,
    apiChapterLink: item.latestChapterSlug ? `/api/chapter/${item.latestChapterSlug}` : undefined,
    mangaSlug: item.slug,
    chapterNumber: item.latestChapterSlug,
    type: item.type,
  };
}

function extractList(raw: unknown): unknown[] {
  const value = unwrapData(raw);
  if (Array.isArray(value)) return value;

  const record = asRecord(value);
  const candidates = [
    record.data,
    record.results,
    record.items,
    record.comics,
    record.doujin,
    record.doujins,
    record.manga,
    record.manhwa,
    record.list,
    record.genres,
    record.latest,
    record.popular,
    record.recommended,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
    const nested = asRecord(candidate);
    if (Array.isArray(nested.items)) return nested.items;
    if (Array.isArray(nested.data)) return nested.data;
    if (Array.isArray(nested.results)) return nested.results;
  }

  return [];
}

function unwrapData(raw: unknown): unknown {
  let current = raw;

  for (let index = 0; index < 3; index += 1) {
    const record = asRecord(current);
    if (record.result !== undefined) {
      current = record.result;
      continue;
    }
    if (record.data === undefined || Array.isArray(record.data)) return current;
    current = record.data;
  }

  return current;
}

function pickField(record: UnknownRecord, keys: string[]) {
  const data = asRecord(record.data);

  for (const key of keys) {
    if (record[key] !== undefined) return record[key];
    if (data[key] !== undefined) return data[key];
  }

  return undefined;
}

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};
}

function firstRecord(...values: unknown[]): UnknownRecord {
  const record = values.find(
    (value) => value && typeof value === "object" && !Array.isArray(value)
  );
  return record ? (record as UnknownRecord) : {};
}

function isType(item: NormalizedComic, type: string) {
  return String(item.type || "").toLowerCase().includes(type);
}

function dedupeComics(comics: NormalizedComic[]) {
  const seen = new Set<string>();

  return comics.filter((comic) => {
    const key = safeSegment(comic.slug) || comic.title.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function emptyHome(): HomeResponse {
  return {
    latest: [],
    popular: {},
    recommended: [],
    genres: [],
  };
}
