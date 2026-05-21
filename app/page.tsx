import { Flame, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ComicCard from "@/components/ComicCard";
import ComicGrid from "@/components/ComicGrid";
import EmptyState from "@/components/EmptyState";
import ErrorMessage from "@/components/ErrorMessage";
import GenreChip from "@/components/GenreChip";
import SectionHeader from "@/components/SectionHeader";
import {
  fetchLatestComics,
  fetchPopularComics,
  fetchRecommendations,
  fetchRecommendedGenres,
} from "@/lib/api";
import { normalizeComicItem, safeSegment, toArray } from "@/lib/utils";

export default async function Home() {
  const [latest, popular, recommendations, genres] = await Promise.all([
    fetchLatestComics(),
    fetchPopularComics(),
    fetchRecommendations(),
    fetchRecommendedGenres(),
  ]);

  const latestComics = latest.data.map(normalizeComicItem).filter((item) => item.slug);
  const recommendedComics = recommendations.data
    .map(normalizeComicItem)
    .filter((item) => item.slug);
  const errors = [latest.error, popular.error, recommendations.error, genres.error].filter(Boolean);
  const popularSections = [
    { key: "manga", title: "Manga", items: toArray(popular.data.manga?.items) },
    { key: "manhwa", title: "Manhwa", items: toArray(popular.data.manhwa?.items) },
    { key: "manhua", title: "Manhua", items: toArray(popular.data.manhua?.items) },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="py-5">
        <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-900/70 sm:p-7">
          <Image
            src="/hero-bg.png"
            alt=""
            fill
            priority
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1100px"
            className="pointer-events-none absolute inset-y-0 right-0 object-cover object-center opacity-20 sm:object-right sm:opacity-30"
            aria-hidden="true"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/90 via-white/55 to-white/10 dark:from-black/20 dark:via-black/20 dark:to-black/10" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-white/10 dark:from-black/20 dark:to-black/10" />

          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
              <Sparkles className="size-4" aria-hidden="true" />
              Update komik terbaru
            </div>
            <h1 className="mt-4 max-w-2xl text-3xl font-black tracking-tight text-zinc-950 dark:text-white sm:text-5xl">
              Baca manga, manhwa, dan manhua dengan reader gelap yang enak di mata.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-700 dark:text-zinc-300 sm:text-base">
              Jelajahi katalog Komik, lanjutkan chapter terbaru, dan temukan genre
              pilihan dari satu tampilan yang ringan untuk mobile.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/pustaka"
                className="rounded-lg bg-cyan-300 px-4 py-3 text-sm font-bold text-zinc-950 transition hover:bg-cyan-200"
              >
                Buka Pustaka
              </Link>
              <Link
                href="/genre"
                className="rounded-lg border border-zinc-200 bg-white/80 px-4 py-3 text-sm font-bold text-zinc-900 transition hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                Pilih Genre
              </Link>
            </div>
          </div>
        </div>
      </section>

      {errors.length ? (
        <div className="my-4">
          <ErrorMessage message={errors[0]} />
        </div>
      ) : null}

      <div className="space-y-6 py-5">
        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900/60 sm:p-5">
          <SectionHeader
            title="Komik terbaru"
            description="Update paling baru dari halaman utama FaruScan."
            href="/pustaka"
          />
          <ComicGrid comics={latestComics.slice(0, 20)} emptyTitle="Komik terbaru kosong" />
        </section>

        <section id="popular" className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900/60 sm:p-5">
          <SectionHeader
            title="Komik populer"
            description="Dipisah berdasarkan Manga, Manhwa, dan Manhua."
          />
          <div className="grid gap-4 lg:grid-cols-3">
            {popularSections.map((section) => {
              const comics = section.items.map(normalizeComicItem).filter((item) => item.slug);
              return (
                <div
                  key={section.key}
                  className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-white/10 dark:bg-zinc-950/35 sm:p-4"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <Flame className="size-5 text-amber-300" aria-hidden="true" />
                    <h3 className="font-bold text-zinc-950 dark:text-white">{section.title}</h3>
                  </div>
                  {comics.length ? (
                    <div className="grid grid-cols-2 gap-3">
                      {comics.slice(0, 4).map((comic, index) => (
                        <ComicCard key={`${comic.slug}-${index}`} comic={comic} />
                      ))}
                    </div>
                  ) : (
                    <EmptyState title={`${section.title} belum tersedia`} />
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900/60 sm:p-5">
          <SectionHeader title="Rekomendasi" description="Pilihan komik untuk mulai baca." />
          <ComicGrid comics={recommendedComics.slice(0, 15)} emptyTitle="Rekomendasi kosong" />
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900/60 sm:p-5">
          <SectionHeader title="Genre pilihan" href="/genre" />
          {genres.data.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {genres.data.slice(0, 18).map((genre) => {
                const slug =
                  safeSegment(genre.slug) ||
                  safeSegment(genre.apiGenreLink?.split("/").filter(Boolean).pop());
                return slug ? (
                  <GenreChip key={`${slug}-${genre.title}`} title={genre.title || slug} slug={slug} />
                ) : null;
              })}
            </div>
          ) : (
            <EmptyState title="Genre pilihan kosong" />
          )}
        </section>
      </div>
    </div>
  );
}
