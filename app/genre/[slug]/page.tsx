import type { Metadata } from "next";
import ComicGrid from "@/components/ComicGrid";
import ErrorMessage from "@/components/ErrorMessage";
import Pagination from "@/components/Pagination";
import SectionHeader from "@/components/SectionHeader";
import { fetchGenreComics } from "@/lib/api";
import { normalizeComicItem, safeSegment } from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Genre ${slug}` };
}

export default async function GenreDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const { slug: rawSlug } = await params;
  const query = await searchParams;
  const slug = safeSegment(rawSlug);
  const currentPage = parsePage(Array.isArray(query.page) ? query.page[0] : query.page);
  const result = await fetchGenreComics(slug, currentPage);
  const comics = (result.data.data || [])
    .map(normalizeComicItem)
    .filter((comic) => comic.slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900/60 sm:p-5">
        <SectionHeader
          title={`Genre ${slug.replaceAll("-", " ")}`}
          description={`${comics.length} item dari Komiktap - halaman ${currentPage}`}
        />
        <ErrorMessage message={result.error} />
        <div className="mt-6">
          <ComicGrid comics={comics} emptyTitle="Genre ini kosong" />
          <Pagination
            currentPage={currentPage}
            basePath={`/genre/${slug}`}
            hasNextPage={Boolean(result.data.hasNextPage)}
          />
        </div>
      </section>
    </div>
  );
}

function parsePage(value?: string) {
  const page = Number.parseInt(String(value || "1"), 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}
