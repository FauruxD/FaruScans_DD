import type { Metadata } from "next";
import ComicGrid from "@/components/ComicGrid";
import ErrorMessage from "@/components/ErrorMessage";
import SectionHeader from "@/components/SectionHeader";
import { fetchColoredComics } from "@/lib/api";
import { normalizeComicItem } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Komik Berwarna",
};

export default async function BerwarnaPage() {
  const result = await fetchColoredComics();
  const comics = (result.data.results || [])
    .map(normalizeComicItem)
    .filter((comic) => comic.slug);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900/60 sm:p-5">
        <SectionHeader
          title="Project"
          description="Daftar project dari Komiktap."
        />
        <ErrorMessage message={result.error} />
        <div className="mt-6">
          <ComicGrid comics={comics} emptyTitle="Project kosong" />
        </div>
      </section>
    </div>
  );
}
