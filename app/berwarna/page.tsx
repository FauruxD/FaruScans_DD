import type { Metadata } from "next";
import ComicGrid from "@/components/ComicGrid";
import ErrorMessage from "@/components/ErrorMessage";
import Pagination from "@/components/Pagination";
import SectionHeader from "@/components/SectionHeader";
import { fetchColoredComics } from "@/lib/api";
import { normalizeComicItem } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Komik Berwarna",
};

export default async function BerwarnaPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const params = await searchParams;
  const pageParam = Array.isArray(params.page) ? params.page[0] : params.page;
  const page = Math.max(1, Number(pageParam) || 1);
  const result = await fetchColoredComics(page);
  const comics = (result.data.data?.results || [])
    .map(normalizeComicItem)
    .filter((comic) => comic.slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900/60 sm:p-5">
        <SectionHeader
          title="Komik berwarna"
          description={`Koleksi warna halaman ${result.data.data?.page || page}`}
        />
        <ErrorMessage message={result.error} />
        <div className="mt-6">
          <ComicGrid comics={comics} emptyTitle="Komik berwarna kosong" />
        </div>
        <Pagination currentPage={page} basePath="/berwarna" hasNextPage={comics.length >= 10} />
      </section>
    </div>
  );
}
