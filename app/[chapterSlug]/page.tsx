import type { Metadata } from "next";
import { ArrowLeft, Images } from "lucide-react";
import Link from "next/link";
import EmptyState from "@/components/EmptyState";
import ErrorMessage from "@/components/ErrorMessage";
import ReadChapterMarker from "@/components/ReadChapterMarker";
import ReaderControls from "@/components/ReaderControls";
import ReaderImage from "@/components/ReaderImage";
import ReaderScrollButtons from "@/components/ReaderScrollButtons";
import { fetchChapterDetail, fetchComicDetail } from "@/lib/api";
import {
  buildChapterHref,
  buildMangaHref,
  extractChapterFromApiLink,
  extractSlugFromDetailLink,
  normalizeReaderChapters,
  parseKomiktapChapterSlug,
  safeSegment,
  textFallback,
  toArray,
} from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ chapterSlug: string }>;
}): Promise<Metadata> {
  const { chapterSlug } = await params;
  return { title: chapterSlug.replaceAll("-", " ") };
}

function navChapter(
  item: { apiLink?: string | null; chapter?: string; chapterNumber?: string } | null | undefined,
) {
  if (!item) return "";
  const chapter =
    item.chapter || item.chapterNumber || extractChapterFromApiLink(item.apiLink);
  return safeSegment(chapter);
}

export default async function KomiktapReaderPage({
  params,
}: {
  params: Promise<{ chapterSlug: string }>;
}) {
  const routeParams = await params;
  const chapterSlug = safeSegment(routeParams.chapterSlug);
  const parsed = parseKomiktapChapterSlug(chapterSlug);
  const slug = parsed.mangaSlug;
  const chapter = parsed.chapter;

  if (!slug || !chapter) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <ErrorMessage message="Format chapter tidak valid." />
      </div>
    );
  }

  const [result, detailResult] = await Promise.all([
    fetchChapterDetail(slug, chapter),
    fetchComicDetail(slug),
  ]);
  const data = result.data;

  if (!data) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <ErrorMessage message={result.error || "Chapter tidak ditemukan."} />
      </div>
    );
  }

  const detailSlug =
    safeSegment(data.mangaInfo?.slug) ||
    extractSlugFromDetailLink(data.mangaInfo?.apiLink) ||
    slug;
  const currentChapter = safeSegment(data.meta?.chapterNumber) || chapter;
  const images = (data.images || []).filter((image) => image.src);
  const pageCount = images.length || data.meta?.totalImages || 0;
  const detailHref = buildMangaHref(detailSlug);
  const chapters = normalizeReaderChapters(
    toArray(detailResult.data?.chapters),
    detailSlug
  );
  const controlChapters = chapters.length
    ? chapters
    : [
        {
          title: textFallback(data.title, `Chapter ${currentChapter}`),
          chapterSlug: currentChapter,
          href: buildChapterHref(detailSlug, currentChapter),
        },
      ];
  const prevChapter = navChapter(data.navigation?.prevChapter);
  const nextChapter = navChapter(data.navigation?.nextChapter);
  const comicTitle = textFallback(data.mangaInfo?.title || detailResult.data?.title, detailSlug);
  const chapterTitle = textFallback(data.title, `Chapter ${currentChapter}`);
  const cover = detailResult.data?.thumbnail;

  return (
    <div className="bg-zinc-50 dark:bg-zinc-950">
      <ReadChapterMarker
        slug={detailSlug}
        chapter={currentChapter}
        title={chapterTitle}
        comicTitle={comicTitle}
        cover={cover}
      />
      <ReaderScrollButtons />
      <header className="border-b border-zinc-200 bg-white dark:border-white/10 dark:bg-zinc-950">
        <div className="mx-auto flex max-w-6xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <Link
              href={detailHref}
              className="flex h-10 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Detail komik
            </Link>
            <div className="min-w-0 sm:text-right">
              <h1 className="line-clamp-2 text-base font-bold text-zinc-950 dark:text-white sm:text-xl">
                {chapterTitle}
              </h1>
              <p className="mt-1 flex items-center gap-2 text-xs text-zinc-500 sm:justify-end sm:text-sm">
                <Images className="size-4" aria-hidden="true" />
                {comicTitle} - {pageCount} halaman
              </p>
            </div>
          </div>

          <ReaderControls
            slug={detailSlug}
            currentChapter={currentChapter}
            chapters={controlChapters}
            prevChapter={prevChapter}
            nextChapter={nextChapter}
            detailHref={detailHref}
          />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-0 py-4 sm:px-4">
        <ErrorMessage message={result.error} />
        <ErrorMessage message={detailResult.error} />
        {images.length ? (
          <div className="space-y-1">
            {images.map((image, index) => (
              <ReaderImage
                key={`${image.src}-${index}`}
                src={image.src || ""}
                alt={image.alt}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="px-4">
            <EmptyState title="Gambar chapter kosong" />
          </div>
        )}
      </main>

      <footer className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <ReaderControls
          slug={detailSlug}
          currentChapter={currentChapter}
          chapters={controlChapters}
          prevChapter={prevChapter}
          nextChapter={nextChapter}
          detailHref={detailHref}
        />
      </footer>
    </div>
  );
}
