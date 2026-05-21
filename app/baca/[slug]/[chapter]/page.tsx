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
  extractChapterFromApiLink,
  extractSlugFromDetailLink,
  normalizeReaderChapters,
  safeSegment,
  textFallback,
  toArray,
} from "@/lib/utils";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; chapter: string }>;
}): Promise<Metadata> {
  const { slug, chapter } = await params;
  return { title: `${slug} chapter ${chapter}` };
}

function navChapter(
  item: { apiLink?: string | null; chapter?: string; chapterNumber?: string } | null | undefined,
) {
  if (!item) return "";
  const chapter =
    item.chapter || item.chapterNumber || extractChapterFromApiLink(item.apiLink);
  return safeSegment(chapter);
}

export default async function ReaderPage({
  params,
}: {
  params: Promise<{ slug: string; chapter: string }>;
}) {
  const routeParams = await params;
  const slug = safeSegment(routeParams.slug);
  const chapter = safeSegment(routeParams.chapter);
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
  const images = (data.images || []).filter((image) => image.src);
  const pageCount = images.length || data.meta?.totalImages || 0;
  const detailHref = `/komik/${detailSlug}`;
  const chapters = normalizeReaderChapters(
    toArray(detailResult.data?.chapters),
    detailSlug
  );
  const controlChapters = chapters.length
    ? chapters
    : [
        {
          title: textFallback(data.title, `Chapter ${chapter}`),
          chapterSlug: chapter,
          href: `/baca/${detailSlug}/${chapter}`,
        },
      ];
  const prevChapter = navChapter(data.navigation?.prevChapter);
  const nextChapter = navChapter(data.navigation?.nextChapter);

  return (
    <div className="bg-zinc-50 dark:bg-zinc-950">
      <ReadChapterMarker slug={slug} chapter={chapter} />
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
                {textFallback(data.title, `Chapter ${chapter}`)}
              </h1>
              <p className="mt-1 flex items-center gap-2 text-xs text-zinc-500 sm:justify-end sm:text-sm">
                <Images className="size-4" aria-hidden="true" />
                {textFallback(data.mangaInfo?.title, detailSlug)} - {pageCount} halaman
              </p>
            </div>
          </div>

          <ReaderControls
            slug={detailSlug}
            currentChapter={chapter}
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
          currentChapter={chapter}
          chapters={controlChapters}
          prevChapter={prevChapter}
          nextChapter={nextChapter}
          detailHref={detailHref}
        />
      </footer>
    </div>
  );
}
