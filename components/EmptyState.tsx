import { SearchX } from "lucide-react";

export default function EmptyState({
  title = "Tidak ada data",
  description = "Coba kata kunci lain atau buka halaman lain.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 bg-white p-8 text-center dark:border-white/15 dark:bg-zinc-900/50">
      <SearchX className="mx-auto size-10 text-zinc-500" aria-hidden="true" />
      <h3 className="mt-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-zinc-600 dark:text-zinc-400">
        {description}
      </p>
    </div>
  );
}
