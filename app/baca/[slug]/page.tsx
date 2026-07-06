import { redirect } from "next/navigation";
import { parseKomiktapChapterSlug, safeSegment } from "@/lib/utils";

export default async function LegacyReaderSingleSegmentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const chapterSlug = safeSegment(slug);
  const parsed = parseKomiktapChapterSlug(chapterSlug);

  if (parsed.mangaSlug && parsed.chapter) {
    redirect(`/${chapterSlug}`);
  }

  redirect("/pustaka");
}
