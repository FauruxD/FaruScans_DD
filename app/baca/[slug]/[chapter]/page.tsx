import { redirect } from "next/navigation";
import { buildChapterHref, safeSegment } from "@/lib/utils";

export default async function LegacyReaderPage({
  params,
}: {
  params: Promise<{ slug: string; chapter: string }>;
}) {
  const { slug, chapter } = await params;
  redirect(buildChapterHref(safeSegment(slug), safeSegment(chapter)));
}
