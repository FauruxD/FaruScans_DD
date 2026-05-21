"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { buildPustakaUrl } from "@/lib/utils";
import type { PustakaSortOption, PustakaTypeFilter } from "@/types/comic";

export default function PustakaFilters({
  search,
  type,
  genre,
  sort,
  genres,
}: {
  search: string;
  type: PustakaTypeFilter;
  genre: string;
  sort: PustakaSortOption;
  genres: { title: string; slug: string }[];
}) {
  const router = useRouter();
  const [keyword, setKeyword] = useState(search);

  const queryState = useMemo(
    () => ({ type, genre, sort }),
    [genre, sort, type]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (keyword.trim() === search.trim()) return;
      router.replace(
        buildPustakaUrl({
          page: 1,
          search: keyword,
          type: queryState.type,
          genre: queryState.genre,
          sort: queryState.sort,
        })
      );
    }, 300);

    return () => window.clearTimeout(timer);
  }, [keyword, queryState, router, search]);

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(
      buildPustakaUrl({
        page: 1,
        search: keyword,
        type,
        genre,
        sort,
      })
    );
  }

  function updateFilter(next: {
    type?: PustakaTypeFilter;
    genre?: string;
    sort?: PustakaSortOption;
  }) {
    router.push(
      buildPustakaUrl({
        page: 1,
        search: keyword,
        type: next.type ?? type,
        genre: next.genre ?? genre,
        sort: next.sort ?? sort,
      })
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-zinc-900">
      <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_170px_190px_170px_auto]">
        <form onSubmit={submitSearch} className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500"
            aria-hidden="true"
          />
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Cari judul komik..."
            className="h-11 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-10 pr-4 text-sm font-medium text-zinc-950 outline-none transition placeholder:text-zinc-500 focus:border-cyan-500/70 focus:bg-white focus:ring-2 focus:ring-cyan-400/15 dark:border-white/10 dark:bg-zinc-950/60 dark:text-white dark:focus:bg-zinc-950"
          />
        </form>

        <FilterSelect
          label="Type"
          value={type}
          onChange={(value) => updateFilter({ type: value as PustakaTypeFilter })}
        >
          <option value="all">Semua</option>
          <option value="manga">Manga</option>
          <option value="manhwa">Manhwa</option>
          <option value="manhua">Manhua</option>
        </FilterSelect>

        <FilterSelect
          label="Genre"
          value={genre || "all"}
          onChange={(value) => updateFilter({ genre: value })}
        >
          <option value="all">Semua genre</option>
          {genres.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.title}
            </option>
          ))}
        </FilterSelect>

        <FilterSelect
          label="Sort"
          value={sort}
          onChange={(value) => updateFilter({ sort: value as PustakaSortOption })}
        >
          <option value="latest">Terbaru</option>
          <option value="az">Judul A-Z</option>
          <option value="za">Judul Z-A</option>
          <option value="views">Views terbanyak</option>
        </FilterSelect>

        <Link
          href="/pustaka"
          className="flex h-11 items-center justify-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm font-bold text-zinc-700 transition hover:bg-zinc-100 dark:border-white/10 dark:bg-white/5 dark:text-zinc-200 dark:hover:bg-white/10"
        >
          <X className="size-4" aria-hidden="true" />
          Reset
        </Link>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="relative block">
      <span className="sr-only">{label}</span>
      <SlidersHorizontal
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-500"
        aria-hidden="true"
      />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-10 pr-3 text-sm font-semibold text-zinc-900 outline-none transition focus:border-cyan-500/70 focus:bg-white focus:ring-2 focus:ring-cyan-400/15 dark:border-white/10 dark:bg-zinc-950/60 dark:text-white dark:focus:bg-zinc-950"
      >
        {children}
      </select>
    </label>
  );
}
