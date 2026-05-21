import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function SectionHeader({
  title,
  description,
  href,
}: {
  title: string;
  description?: string;
  href?: string;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white sm:text-2xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
        ) : null}
      </div>
      {href ? (
        <Link
          href={href}
          className="shrink-0 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-semibold text-zinc-800 transition hover:bg-zinc-100 hover:text-cyan-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10 dark:hover:text-cyan-200"
        >
          Lihat semua
          <ArrowRight className="ml-1 inline size-3.5" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}
