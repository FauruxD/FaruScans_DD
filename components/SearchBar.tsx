"use client";

import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function SearchBar({
  compact = false,
  initialValue = "",
}: {
  compact?: boolean;
  initialValue?: string;
}) {
  const router = useRouter();
  const [keyword, setKeyword] = useState(initialValue);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const q = keyword.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={onSubmit} className="relative w-full">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500"
      />
      <input
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        placeholder={compact ? "Cari" : "Cari judul komik..."}
        className="h-11 w-full rounded-lg border border-zinc-200 bg-white pl-10 pr-4 text-sm text-zinc-950 outline-none transition focus:border-cyan-500/70 focus:bg-white focus:ring-2 focus:ring-cyan-400/15 dark:border-white/10 dark:bg-zinc-950/70 dark:text-zinc-100 dark:focus:bg-zinc-950"
      />
    </form>
  );
}
