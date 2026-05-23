import { Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ComicGrid from "@/components/ComicGrid";
import EmptyState from "@/components/EmptyState";
import ErrorMessage from "@/components/ErrorMessage";
import GenreChip from "@/components/GenreChip";
import SectionHeader from "@/components/SectionHeader";
import StarfieldBackground from "@/components/StarfieldBackground";
import {
  fetchDoujinList,
  fetchGenres,
  fetchMangaList,
  fetchManhwaList,
} from "@/lib/api";
import { normalizeComicItem, safeSegment } from "@/lib/utils";

export default async function Home() {
  const [manhwa, doujin, manga, genresResult] = await Promise.all([
    fetchManhwaList(),
    fetchDoujinList(),
    fetchMangaList(),
    fetchGenres(),
  ]);

  const manhwaComics = manhwa.data.map(normalizeComicItem).filter((item) => item.slug);
  const doujinComics = doujin.data.map(normalizeComicItem).filter((item) => item.slug);
  const mangaComics = manga.data
    .map(normalizeComicItem)
    .filter((item) => item.slug);
  const errors = [manhwa.error, doujin.error, manga.error, genresResult.error].filter(Boolean);
  const genres = genresResult.data;

  return (
    <div className="relative">
      <StarfieldBackground />
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
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
            title="Manhwa"
            description="Daftar manhwa dari Doujindesu."
            href="/pustaka"
          />
          <ComicGrid comics={manhwaComics.slice(0, 20)} emptyTitle="Manhwa kosong" />
        </section>

        <section id="popular" className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900/60 sm:p-5">
          <SectionHeader
            title="Doujin"
            description="Daftar doujin dari Doujindesu."
          />
          <ComicGrid comics={doujinComics.slice(0, 20)} emptyTitle="Doujin kosong" />
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900/60 sm:p-5">
          <SectionHeader title="Manga" description="Daftar manga dari Doujindesu." />
          <ComicGrid comics={mangaComics.slice(0, 15)} emptyTitle="Manga kosong" />
        </section>

        <section className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-zinc-900/60 sm:p-5">
          <SectionHeader title="Genre pilihan" href="/genre" />
          {genres.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {genres.slice(0, 18).map((genre) => {
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
    </div>
  );
}
