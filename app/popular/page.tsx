import type { Metadata } from "next";
import Link from "next/link";
import ComicGrid from "@/components/ComicGrid";
import EmptyState from "@/components/EmptyState";
import ErrorMessage from "@/components/ErrorMessage";
import SectionHeader from "@/components/SectionHeader";
import StarfieldBackground from "@/components/StarfieldBackground";
import { fetchPopular } from "@/lib/api";
import { cn, normalizeComicItem, safeSegment } from "@/lib/utils";
import type { NormalizedComic } from "@/types/comic";

export const metadata: Metadata = {
  title: "Komik Populer",
};

const tabs = [
  { label: "Semua", value: "all" },
  { label: "Doujin", value: "doujinshi" },
  { label: "Manga", value: "manga" },
  { label: "Manhwa", value: "manhwa" },
] as const;

type PopularType = (typeof tabs)[number]["value"];

export default async function PopularPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string | string[] }>;
}) {
  const params = await searchParams;
  const typeParam = Array.isArray(params.type) ? params.type[0] : params.type;
  const type = tabs.some((item) => item.value === typeParam)
    ? (typeParam as PopularType)
    : "all";
  const result = await fetchPopular();
  const all = dedupeComics(result.data.map(normalizeComicItem).filter((comic) => comic.slug));
  const manga = all.filter((comic) => comic.type?.toLowerCase().includes("manga"));
  const manhwa = all.filter((comic) => comic.type?.toLowerCase().includes("manhwa"));
  const doujinshi = all.filter((comic) => {
    const comicType = comic.type?.toLowerCase() || "";
    return comicType.includes("doujin") || (!comicType.includes("manga") && !comicType.includes("manhwa"));
  });
  const comicsByType: Record<PopularType, NormalizedComic[]> = {
    all,
    doujinshi,
    manga,
    manhwa,
  };
  const comics = comicsByType[type];

  return (
    <div className="relative">
      <StarfieldBackground />
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="rounded-xl border border-zinc-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-900/70 sm:p-5">
          <SectionHeader
            title="Komik populer"
            description="Daftar komik populer berdasarkan kategori."
          />
          <ErrorMessage message={result.error} />

          <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
            {tabs.map((item) => {
              const active = item.value === type;

              return (
                <Link
                  key={item.value}
                  href={`/popular?type=${item.value}`}
                  className={cn(
                    "shrink-0 rounded-lg border px-4 py-2 text-sm font-bold transition",
                    active
                      ? "border-cyan-300 bg-cyan-300 text-zinc-950"
                      : "border-zinc-200 bg-white/80 text-zinc-700 hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {comics.length ? (
            <ComicGrid comics={comics} emptyTitle="Komik populer kosong" />
          ) : (
            <EmptyState title="Komik populer kosong" />
          )}
        </section>
      </div>
    </div>
  );
}

function dedupeComics(comics: NormalizedComic[]) {
  const seen = new Set<string>();

  return comics.filter((comic) => {
    const key = safeSegment(comic.slug) || comic.title.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
