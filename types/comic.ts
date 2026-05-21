// ==========================================
// Types for Komiku REST API responses
// ==========================================

// --- Shared / Normalized ---

export interface NormalizedComic {
  title: string;
  slug: string;
  thumbnail: string;
  type: string;
  genre: string;
  updateTime?: string;
  latestChapterTitle?: string;
  latestChapterSlug?: string;
  latestChapterHref?: string;
  isColored?: boolean;
  views?: string;
  description?: string;
}

export type PustakaTypeFilter = "all" | "manga" | "manhwa" | "manhua";

export type PustakaSortOption = "latest" | "az" | "za" | "views";

export interface ReaderControlChapter {
  title: string;
  chapterSlug: string;
  href: string;
}

export interface ApiResult<T> {
  data: T;
  error: string | null;
}

// --- /terbaru ---

export interface TerbaruItem {
  title?: string;
  originalLink?: string;
  thumbnail?: string;
  type?: string;
  genre?: string;
  updateTime?: string;
  latestChapterTitle?: string;
  latestChapterLink?: string;
  isColored?: boolean;
  updateCountText?: string;
  mangaSlug?: string;
  apiDetailLink?: string;
  apiChapterLink?: string;
}

// --- /komik-populer ---

export interface PopulerItem {
  title?: string;
  originalLink?: string;
  apiDetailLink?: string;
  thumbnail?: string;
  genre?: string;
  readers?: string;
  latestChapter?: string;
  originalChapterLink?: string;
  apiChapterLink?: string;
  mangaSlug?: string;
  chapterNumber?: string;
}

export interface PopulerCategory {
  title?: string;
  items?: PopulerItem[];
}

export interface PopulerResponse {
  manga?: PopulerCategory;
  manhwa?: PopulerCategory;
  manhua?: PopulerCategory;
}

// --- /rekomendasi ---

export interface RekomendasiItem {
  title?: string;
  originalLink?: string;
  apiDetailLink?: string;
  thumbnail?: string;
}

// --- /genre-rekomendasi ---

export interface GenreRekomendasiItem {
  title?: string;
  slug?: string;
  originalLink?: string;
  readLink?: string;
  apiGenreLink?: string;
  thumbnail?: string;
}

// --- /genre-all ---

export interface GenreAllItem {
  title?: string;
  slug?: string;
  apiGenreLink?: string;
  titleAttr?: string;
}

// --- /genre/:slug ---

export interface GenreDetailChapter {
  chapter?: string;
  link?: string;
  apiLink?: string;
}

export interface GenreDetailItem {
  title?: string;
  slug?: string;
  type?: string;
  genre?: string;
  thumbnail?: string;
  description?: string;
  additionalInfo?: string;
  updateStatus?: string;
  apiMangaLink?: string;
  chapters?: {
    first?: GenreDetailChapter;
    latest?: GenreDetailChapter;
  };
}

export interface GenreDetailResponse {
  success?: boolean;
  genre?: string;
  currentPage?: number;
  totalManga?: number;
  hasNextPage?: boolean;
  nextPageUrl?: string;
  data?: GenreDetailItem[];
}

// --- /detail-komik/:slug ---

export interface ComicInfo {
  "Judul Komik"?: string;
  "Judul Indonesia"?: string;
  "Jenis Komik"?: string;
  "Konsep Cerita"?: string;
  "Pengarang"?: string;
  "Status"?: string;
  "Umur Pembaca"?: string;
  "Cara Baca"?: string;
  [key: string]: string | undefined;
}

export interface ChapterItem {
  title?: string;
  originalLink?: string;
  apiLink?: string;
  views?: string;
  date?: string;
  chapterNumber?: string;
}

export interface SimilarComic {
  title?: string;
  originalLink?: string;
  apiLink?: string;
  thumbnail?: string;
  type?: string;
  genres?: string;
  synopsis?: string;
  views?: string;
  slug?: string;
}

export interface ComicDetail {
  title?: string;
  alternativeTitle?: string;
  description?: string;
  sinopsis?: string;
  thumbnail?: string;
  info?: ComicInfo;
  genres?: string[];
  slug?: string;
  firstChapter?: ChapterItem;
  latestChapter?: ChapterItem;
  chapters?: ChapterItem[];
  similarKomik?: SimilarComic[];
}

// --- /baca-chapter/:slug/:chapter ---

export interface ChapterImage {
  src?: string;
  alt?: string;
  id?: string;
  fallbackSrc?: string;
}

export interface ChapterNavItem {
  title?: string;
  originalLink?: string;
  apiLink?: string;
  chapter?: string;
  chapterNumber?: string;
  slug?: string;
}

export interface ChapterNavigation {
  prevChapter?: ChapterNavItem | null;
  nextChapter?: ChapterNavItem | null;
  allChapters?: string;
}

export interface ChapterMeta {
  chapterNumber?: string;
  totalImages?: number;
  publishDate?: string;
  slug?: string;
}

export interface ChapterMangaInfo {
  title?: string;
  originalLink?: string;
  apiLink?: string;
  slug?: string;
}

export interface ChapterDetail {
  title?: string;
  mangaInfo?: ChapterMangaInfo;
  description?: string;
  chapterInfo?: Record<string, string>;
  images?: ChapterImage[];
  meta?: ChapterMeta;
  navigation?: ChapterNavigation;
  additionalDescription?: string;
}

// --- /search ---

export interface SearchItem {
  title?: string;
  altTitle?: string | null;
  slug?: string;
  href?: string;
  thumbnail?: string;
  type?: string;
  genre?: string;
  description?: string;
}

export interface SearchResponse {
  status?: boolean;
  message?: string;
  keyword?: string;
  url?: string;
  total?: number;
  data?: SearchItem[];
}

// --- /pustaka ---

export interface PustakaChapter {
  title?: string;
  url?: string;
}

export interface PustakaItem {
  title?: string;
  thumbnail?: string;
  type?: string;
  genre?: string;
  url?: string;
  detailUrl?: string;
  description?: string;
  stats?: string;
  firstChapter?: PustakaChapter;
  latestChapter?: PustakaChapter;
}

export interface PustakaResponse {
  page?: number;
  results?: PustakaItem[];
  hasNextPage?: boolean;
  sourcePages?: number[];
}

// --- /berwarna ---

export interface BerwarnaItem {
  title?: string;
  thumbnail?: string;
  type?: string;
  genre?: string;
  url?: string;
  detailUrl?: string;
  description?: string;
  stats?: string;
  firstChapter?: PustakaChapter;
  latestChapter?: PustakaChapter;
}

export interface BerwarnaDataResponse {
  page?: number;
  results?: BerwarnaItem[];
  total?: number;
  success?: boolean;
}

export interface BerwarnaResponse {
  status?: boolean;
  message?: string;
  data?: BerwarnaDataResponse;
}
