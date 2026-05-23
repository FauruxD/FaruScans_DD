import type { Metadata } from "next";
import Link from "next/link";
import ComicGrid from "@/components/ComicGrid";
import EmptyState from "@/components/EmptyState";
import ErrorMessage from "@/components/ErrorMessage";
import PustakaFilters from "@/components/PustakaFilters";
import SectionHeader from "@/components/SectionHeader";
import {
  fetchAllLibrary,
  fetchDoujinList,
  fetchGenres,
  fetchGenreDetail,
  fetchMangaList,
  fetchManhwaList,
} from "@/lib/api";
import {
  matchesComicGenre,
  matchesComicSearch,
  normalizeComicItem,
  safeSegment,
  sortComics,
} from "@/lib/utils";
import type { PustakaSortOption, PustakaTypeFilter } from "@/types/comic";

export const metadata: Metadata = {
  title: "Pustaka",
};

type DoujindesuPustakaType = Extract<PustakaTypeFilter, "all" | "doujin" | "manga" | "manhwa">;

const typeOptions = ["all", "doujin", "manga", "manhwa"] satisfies DoujindesuPustakaType[];
const sortOptions = ["latest", "az", "za", "views"] satisfies PustakaSortOption[];

export default async function PustakaPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string | string[];
    type?: string | string[];
    genre?: string | string[];
    sort?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const searchParam = pickParam(params.search);
  const typeParam = pickParam(params.type);
  const genreParam = pickParam(params.genre);
  const sortParam = pickParam(params.sort);
  const type = typeOptions.includes(typeParam as DoujindesuPustakaType)
    ? (typeParam as DoujindesuPustakaType)
    : "all";
  const sort = sortOptions.includes(sortParam as PustakaSortOption)
    ? (sortParam as PustakaSortOption)
    : "latest";
  const genre = safeSegment(genreParam) || "all";
  const libraryRequest =
    genre !== "all"
      ? fetchGenreDetail(genre)
      : fetchLibraryByType(type);
  const [result, genreResult] = await Promise.all([
    libraryRequest,
    fetchGenres(),
  ]);
  const resultData = result.data as unknown[] | { data?: unknown[] };
  const rawComics = Array.isArray(resultData) ? resultData : resultData.data || [];
  const comics = rawComics
    .map(normalizeComicItem)
    .filter((comic) => comic.slug)
    .filter((comic) => matchesComicSearch(comic, searchParam))
    .filter((comic) => (genre !== "all" ? true : matchesComicGenre(comic, genre)));
  const filteredComics = sortComics(comics, sort);
  const genres = genreResult.data
    .map((item) => ({
      title: item.title || item.titleAttr || item.slug || "Genre",
      slug: safeSegment(item.slug || item.apiGenreLink?.split("/").filter(Boolean).pop()),
    }))
    .filter((item) => item.slug);
  const hasFilters =
    Boolean(searchParam.trim()) || type !== "all" || genre !== "all" || sort !== "latest";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900/60 sm:p-5">
        <SectionHeader
          title="Katalog"
          description={`${filteredComics.length} item dari Doujindesu`}
        />
        <ErrorMessage message={result.error} />
        <ErrorMessage message={genreResult.error} />
        <div className="mt-5">
          <PustakaFilters
            key={`${searchParam}-${type}-${genre}-${sort}`}
            search={searchParam}
            type={type}
            genre={genre}
            sort={sort}
            genres={genres}
          />
        </div>
        <div className="mt-6">
          {filteredComics.length ? (
            <ComicGrid comics={filteredComics} emptyTitle="Pustaka kosong" />
          ) : hasFilters ? (
            <div className="space-y-4">
              <EmptyState
                title="Tidak ada komik yang cocok"
                description="Coba ubah kata kunci, type, genre, atau urutan sortir."
              />
              <div className="flex justify-center">
                <Link
                  href="/pustaka"
                  className="rounded-lg bg-cyan-300 px-4 py-3 text-sm font-bold text-zinc-950 transition hover:bg-cyan-200"
                >
                  Reset filter
                </Link>
              </div>
            </div>
          ) : (
            <ComicGrid comics={filteredComics} emptyTitle="Pustaka kosong" />
          )}
        </div>
      </section>
    </div>
  );
}

function fetchLibraryByType(type: DoujindesuPustakaType) {
  if (type === "doujin") return fetchDoujinList();
  if (type === "manga") return fetchMangaList();
  if (type === "manhwa") return fetchManhwaList();
  return fetchAllLibrary();
}

function pickParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}
