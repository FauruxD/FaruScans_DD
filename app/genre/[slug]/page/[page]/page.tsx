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
  params: Promise<{ slug: string; page: string }>;
}): Promise<Metadata> {
  const { slug, page } = await params;
  return { title: `Genre ${slug} halaman ${page}` };
}

export default async function GenrePagedPage({
  params,
}: {
  params: Promise<{ slug: string; page: string }>;
}) {
  const routeParams = await params;
  const slug = safeSegment(routeParams.slug);
  const page = Math.max(1, Number(routeParams.page) || 1);
  const result = await fetchGenreComics(slug, page);
  const comics = (result.data.data || [])
    .map(normalizeComicItem)
    .filter((comic) => comic.slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900/60 sm:p-5">
        <SectionHeader
          title={`Genre ${slug.replaceAll("-", " ")}`}
          description={`Halaman ${page}`}
        />
        <ErrorMessage message={result.error} />
        <div className="mt-6">
          <ComicGrid comics={comics} emptyTitle="Genre ini kosong" />
        </div>
        <Pagination
          currentPage={page}
          basePath={`/genre/${slug}`}
          queryMode={false}
          hasNextPage={Boolean(result.data.hasNextPage)}
        />
      </section>
    </div>
  );
}
