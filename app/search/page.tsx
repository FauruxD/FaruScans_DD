import type { Metadata } from "next";
import ComicGrid from "@/components/ComicGrid";
import EmptyState from "@/components/EmptyState";
import ErrorMessage from "@/components/ErrorMessage";
import SearchBar from "@/components/SearchBar";
import SectionHeader from "@/components/SectionHeader";
import { searchComics } from "@/lib/api";
import { normalizeComicItem } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Search",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const params = await searchParams;
  const keyword = Array.isArray(params.q) ? params.q[0] : params.q || "";
  const query = keyword.trim();

  if (!query) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900/60 sm:p-5">
          <SectionHeader title="Cari komik" description="Masukkan judul manga, manhwa, atau manhua." />
          <div className="mb-6 max-w-xl">
            <SearchBar initialValue={query} />
          </div>
          <EmptyState title="Belum ada kata kunci" description="Ketik judul komik di kolom pencarian." />
        </section>
      </div>
    );
  }

  const result = await searchComics(query);
  const comics = (result.data.data || [])
    .map(normalizeComicItem)
    .filter((comic) => comic.slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900/60 sm:p-5">
        <SectionHeader title={`Hasil: ${query}`} description={`${comics.length} komik ditemukan`} />
        <div className="mb-6 max-w-xl">
          <SearchBar initialValue={query} />
        </div>
        <ErrorMessage message={result.error} />
        <div className="mt-6">
          {comics.length ? (
            <ComicGrid comics={comics} />
          ) : (
            <EmptyState title="Tidak ada hasil" description="Coba kata kunci yang lebih pendek atau judul lain." />
          )}
        </div>
      </section>
    </div>
  );
}
