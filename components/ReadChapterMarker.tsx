"use client";

import { useEffect } from "react";
import { markChapterAsRead } from "@/lib/reading-history";

export default function ReadChapterMarker({
  slug,
  chapter,
}: {
  slug: string;
  chapter: string;
}) {
  useEffect(() => {
    markChapterAsRead(slug, chapter);
  }, [slug, chapter]);

  return null;
}
