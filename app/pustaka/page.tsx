import type { Metadata } from "next";
import Link from "next/link";
import ComicGrid from "@/components/ComicGrid";
import EmptyState from "@/components/EmptyState";
import ErrorMessage from "@/components/ErrorMessage";
import Pagination from "@/components/Pagination";
import PustakaFilters from "@/components/PustakaFilters";
import SectionHeader from "@/components/SectionHeader";
import { fetchAllGenres, fetchLibraryComics } from "@/lib/api";
import {
  matchesComicGenre,
  matchesComicSearch,
  matchesComicType,
  normalizeComicItem,
  safeSegment,
  sortComics,
} from "@/lib/utils";
import type { PustakaSortOption, PustakaTypeFilter } from "@/types/comic";

export const metadata: Metadata = {
  title: "Pustaka",
};

const typeOptions = ["all", "manga", "manhwa", "manhua"] satisfies PustakaTypeFilter[];
const sortOptions = ["latest", "az", "za", "views"] satisfies PustakaSortOption[];

export default async function PustakaPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string | string[];
    search?: string | string[];
    type?: string | string[];
    genre?: string | string[];
    sort?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const pageParam = Array.isArray(params.page) ? params.page[0] : params.page;
  const searchParam = pickParam(params.search);
  const typeParam = pickParam(params.type);
  const genreParam = pickParam(params.genre);
  const sortParam = pickParam(params.sort);
  const page = Math.max(1, Number(pageParam) || 1);
  const type = typeOptions.includes(typeParam as PustakaTypeFilter)
    ? (typeParam as PustakaTypeFilter)
    : "all";
  const sort = sortOptions.includes(sortParam as PustakaSortOption)
    ? (sortParam as PustakaSortOption)
    : "latest";
  const genre = safeSegment(genreParam) || "all";
  const [result, genreResult] = await Promise.all([
    fetchLibraryComics(page),
    fetchAllGenres(),
  ]);
  const comics = (result.data.results || [])
    .map(normalizeComicItem)
    .filter((comic) => comic.slug)
    .filter((comic) => matchesComicSearch(comic, searchParam))
    .filter((comic) => matchesComicType(comic, type))
    .filter((comic) => matchesComicGenre(comic, genre));
  const filteredComics = sortComics(comics, sort).slice(0, 25);
  const genres = genreResult.data
    .map((item) => ({
      title: item.title || item.titleAttr || item.slug || "Genre",
      slug: safeSegment(item.slug || item.apiGenreLink?.split("/").filter(Boolean).pop()),
    }))
    .filter((item) => item.slug);
  const sourcePages = result.data.sourcePages?.join(", ");
  const hasFilters =
    Boolean(searchParam.trim()) || type !== "all" || genre !== "all" || sort !== "latest";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900/60 sm:p-5">
        <SectionHeader
          title="Pustaka komik"
          description={
            sourcePages
              ? `Halaman ${result.data.page || page}`
              : `Halaman ${result.data.page || page}`
          }
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
        <Pagination
          currentPage={page}
          basePath="/pustaka"
          hasNextPage={Boolean(result.data.hasNextPage)}
          queryParams={{
            search: searchParam.trim() || undefined,
            type: type !== "all" ? type : undefined,
            genre: genre !== "all" ? genre : undefined,
            sort: sort !== "latest" ? sort : undefined,
          }}
        />
      </section>
    </div>
  );
}

function pickParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}
