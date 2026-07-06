import { redirect } from "next/navigation";
import { safeSegment } from "@/lib/utils";

export default async function LegacyComicDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/manga/${safeSegment(slug)}`);
}
