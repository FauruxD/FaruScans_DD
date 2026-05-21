import Link from "next/link";

export default function GenreChip({
  title,
  slug,
}: {
  title: string;
  slug: string;
}) {
  return (
    <Link
      href={`/genre/${slug}`}
      className="rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-800 transition hover:border-cyan-400/60 hover:bg-cyan-300 hover:text-zinc-950 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:border-cyan-300/50"
    >
      {title}
    </Link>
  );
}
