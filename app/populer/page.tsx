import type { Metadata } from "next";
import ComicGrid from "@/components/ComicGrid";
import ErrorMessage from "@/components/ErrorMessage";
import Pagination from "@/components/Pagination";
import SectionHeader from "@/components/SectionHeader";
import StarfieldBackground from "@/components/StarfieldBackground";
import { fetchPopularPage } from "@/lib/api";
import { normalizeComicItem } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Komik Populer",
};

export default async function PopulerPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const params = await searchParams;
  const currentPage = parsePage(Array.isArray(params.page) ? params.page[0] : params.page);
  const result = await fetchPopularPage(currentPage);
  const comics = result.data.results
    .map(normalizeComicItem)
    .filter((comic) => comic.slug);

  return (
    <div className="relative">
      <StarfieldBackground />
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-xl border border-zinc-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-900/70 sm:p-5">
          <SectionHeader
            title="Populer"
            description={`A-Z List Komiktap - halaman ${currentPage}`}
          />
          <ErrorMessage message={result.error} />

          <div className="mt-6">
            <ComicGrid comics={comics} emptyTitle="Komik populer kosong" />
            <Pagination
              currentPage={currentPage}
              basePath="/populer"
              hasNextPage={result.data.hasNextPage}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function parsePage(value?: string) {
  const page = Number.parseInt(String(value || "1"), 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}
