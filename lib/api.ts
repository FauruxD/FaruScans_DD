import type {
  ApiResult,
  BerwarnaResponse,
  ChapterDetail,
  ComicDetail,
  GenreAllItem,
  GenreDetailResponse,
  GenreRekomendasiItem,
  PopulerResponse,
  PustakaItem,
  PustakaResponse,
  RekomendasiItem,
  SearchResponse,
  TerbaruItem,
} from "@/types/comic";
import { extractSlugFromDetailLink } from "@/lib/utils";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://komiku-rest-api.vercel.app";

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

export async function fetchLatestComics() {
  return safeApi<TerbaruItem[]>(
    async () => {
      const data = await fetcher<TerbaruItem[]>("/terbaru", 120);
      return Array.isArray(data) ? data : [];
    },
    []
  );
}

export async function fetchPopularComics() {
  return safeApi<PopulerResponse>(
    () => fetcher<PopulerResponse>("/komik-populer", 300),
    {}
  );
}

export async function fetchRecommendations() {
  return safeApi<RekomendasiItem[]>(
    async () => {
      const data = await fetcher<RekomendasiItem[]>("/rekomendasi", 600);
      return Array.isArray(data) ? data : [];
    },
    []
  );
}

export async function fetchRecommendedGenres() {
  return safeApi<GenreRekomendasiItem[]>(
    async () => {
      const data = await fetcher<GenreRekomendasiItem[]>(
        "/genre-rekomendasi",
        3600
      );
      return Array.isArray(data) ? data : [];
    },
    []
  );
}

export async function fetchComicDetail(slug: string) {
  return safeApi<ComicDetail | null>(
    () => fetcher<ComicDetail>(`/detail-komik/${slug}`, 300),
    null
  );
}

export async function fetchChapterDetail(slug: string, chapter: string) {
  return safeApi<ChapterDetail | null>(
    () => fetcher<ChapterDetail>(`/baca-chapter/${slug}/${chapter}`, 600),
    null
  );
}

export async function searchComics(keyword: string) {
  return safeApi<SearchResponse>(
    () => fetcher<SearchResponse>(`/search?q=${encodeURIComponent(keyword)}`, 60),
    { status: false, data: [], total: 0 }
  );
}

export async function fetchLibraryComics(page = 1) {
  const normalizedPage = Math.max(1, Number(page) || 1);
  return safeApi<PustakaResponse>(
    async () => {
      const pageSize = 25;
      const apiPageSize = 10;
      const startIndex = (normalizedPage - 1) * pageSize;
      const apiStartPage = Math.floor(startIndex / apiPageSize) + 1;
      const offset = startIndex % apiPageSize;
      const fetchPageCount = Math.ceil((offset + pageSize + 1) / apiPageSize);
      const sourcePages = Array.from(
        { length: fetchPageCount },
        (_, index) => apiStartPage + index
      );
      const settled = await Promise.allSettled(
        sourcePages.map((sourcePage) =>
          fetcher<PustakaResponse>(
            sourcePage > 1 ? `/pustaka/page/${sourcePage}` : "/pustaka",
            300
          )
        )
      );
      const fulfilled = settled
        .filter(
          (result): result is PromiseFulfilledResult<PustakaResponse> =>
            result.status === "fulfilled"
        )
        .map((result) => result.value);

      if (!fulfilled.length) {
        const firstError = settled.find(
          (result): result is PromiseRejectedResult => result.status === "rejected"
        );
        throw firstError?.reason instanceof Error
          ? firstError.reason
          : new Error("Gagal mengambil data pustaka.");
      }

      const results = dedupeLibraryItems(fulfilled.flatMap((item) => item.results || []));
      const lastSourceCount = fulfilled[fulfilled.length - 1]?.results?.length || 0;
      const pageResults = results.slice(offset, offset + pageSize);

      return {
        page: normalizedPage,
        sourcePages,
        results: pageResults,
        hasNextPage: results.length > offset + pageSize || lastSourceCount > 0,
      };
    },
    { page: normalizedPage, results: [], hasNextPage: false }
  );
}

function dedupeLibraryItems(items: PustakaItem[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key =
      extractSlugFromDetailLink(item.detailUrl || item.url) ||
      item.title?.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function fetchAllGenres() {
  return safeApi<GenreAllItem[]>(
    async () => {
      const data = await fetcher<GenreAllItem[]>("/genre-all", 3600);
      return Array.isArray(data) ? data : [];
    },
    []
  );
}

export async function fetchGenreComics(slug: string, page = 1) {
  const normalizedPage = Math.max(1, Number(page) || 1);
  return safeApi<GenreDetailResponse>(
    () =>
      fetcher<GenreDetailResponse>(
        normalizedPage > 1
          ? `/genre/${slug}/page/${normalizedPage}`
          : `/genre/${slug}`,
        300
      ),
    { success: false, currentPage: normalizedPage, data: [] }
  );
}

export async function fetchColoredComics(page = 1) {
  const normalizedPage = Math.max(1, Number(page) || 1);
  return safeApi<BerwarnaResponse>(
    () =>
      fetcher<BerwarnaResponse>(
        normalizedPage > 1 ? `/berwarna/${normalizedPage}` : "/berwarna",
        300
      ),
    { status: false, data: { page: normalizedPage, results: [] } }
  );
}
