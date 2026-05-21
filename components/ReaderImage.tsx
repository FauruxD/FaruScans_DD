"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export default function ReaderImage({
  src,
  alt,
  index,
}: {
  src: string;
  alt?: string;
  index: number;
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    <figure className="relative mx-auto w-full max-w-4xl overflow-hidden bg-zinc-100 dark:bg-zinc-950">
      {!loaded ? (
        <div className="skeleton-shimmer absolute inset-0 min-h-[70vh]" />
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element -- Chapter pages need native lazy images because dimensions are unknown and API images are already optimized by source CDN. */}
      <img
        src={src}
        alt={alt || `Halaman ${index + 1}`}
        loading={index < 2 ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={cn(
          "mx-auto block h-auto w-full transition-opacity duration-300",
          loaded ? "opacity-100" : "min-h-[70vh] opacity-0"
        )}
      />
    </figure>
  );
}
