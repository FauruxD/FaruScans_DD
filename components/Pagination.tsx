import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export default function Pagination({
  currentPage,
  basePath,
  hasNextPage = true,
  queryMode = true,
  totalPages,
  queryParams,
}: {
  currentPage: number;
  basePath: string;
  hasNextPage?: boolean;
  queryMode?: boolean;
  totalPages?: number;
  queryParams?: Record<string, string | number | boolean | null | undefined>;
}) {
  const page = Math.max(1, currentPage);
  const pages = getPageWindow(page, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className="mt-8 flex flex-wrap items-center justify-center gap-2"
    >
      <PageLink
        href={page > 1 ? pageHref(page - 1, basePath, queryMode, queryParams) : "#"}
        disabled={page <= 1}
        ariaLabel="Halaman sebelumnya"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
      </PageLink>

      {pages.map((item) => (
        <PageLink
          key={item}
          href={pageHref(item, basePath, queryMode, queryParams)}
          active={item === page}
          ariaLabel={`Halaman ${item}`}
        >
          {item}
        </PageLink>
      ))}

      <PageLink
        href={hasNextPage ? pageHref(page + 1, basePath, queryMode, queryParams) : "#"}
        disabled={!hasNextPage}
        ariaLabel="Halaman berikutnya"
      >
        <ChevronRight className="size-4" aria-hidden="true" />
      </PageLink>
    </nav>
  );
}

function PageLink({
  href,
  children,
  active = false,
  disabled = false,
  ariaLabel,
}: {
  href: string;
  children: ReactNode;
  active?: boolean;
  disabled?: boolean;
  ariaLabel: string;
}) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      aria-current={active ? "page" : undefined}
      aria-disabled={disabled}
      className={cn(
        "flex size-11 items-center justify-center rounded-lg border text-sm font-bold transition",
        active
          ? "border-cyan-300 bg-cyan-300 text-zinc-950"
          : "border-zinc-200 bg-white text-zinc-900 hover:border-cyan-400/60 hover:bg-zinc-100 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:border-cyan-300/50 dark:hover:bg-white/10",
        disabled && "pointer-events-none bg-zinc-100 text-zinc-400 dark:bg-zinc-900/40 dark:text-zinc-600"
      )}
    >
      {children}
    </Link>
  );
}

function pageHref(
  page: number,
  basePath: string,
  queryMode: boolean,
  queryParams?: Record<string, string | number | boolean | null | undefined>
) {
  if (queryMode) {
    const params = new URLSearchParams();

    Object.entries(queryParams || {}).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "" || value === false) {
        return;
      }
      params.set(key, String(value));
    });

    params.set("page", String(page));
    return `${basePath}?${params.toString()}`;
  }

  return page <= 1 ? basePath : `${basePath}/page/${page}`;
}

function getPageWindow(currentPage: number, totalPages?: number) {
  const windowSize = 5;
  const maxPage = totalPages && totalPages > 0 ? totalPages : undefined;
  let start = Math.max(1, currentPage - 2);

  if (currentPage <= 3) start = 1;
  if (maxPage && start + windowSize - 1 > maxPage) {
    start = Math.max(1, maxPage - windowSize + 1);
  }

  const length = maxPage
    ? Math.min(windowSize, maxPage - start + 1)
    : windowSize;

  return Array.from({ length }, (_, index) => start + index);
}
