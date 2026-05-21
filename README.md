# FaruScan

Modern manga, manhwa, and manhua reader built with **Next.js**, **TypeScript**, and **Tailwind CSS**.

FaruScan provides a clean dark-mode reading experience with responsive UI, chapter tracking, filters, search, and modern manga-style layouts.

---

# Preview

## Features

- Modern dark/light mode UI
- Manga / Manhwa / Manhua reader
- Responsive mobile-friendly layout
- Reading history tracking
- Chapter read indicator
- Search & filters
- Genre browsing
- Latest updates
- Popular comics
- Recommendations
- Smooth pagination
- Fast Next.js App Router architecture

---

# Tech Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- next-themes
- Lucide React
- Vercel Deployment

---

# Project Structure

```bash
app/
  page.tsx
  layout.tsx
  globals.css

  pustaka/
    page.tsx

  komik/
    [slug]/
      page.tsx

  baca/
    [slug]/
      [chapter]/
        page.tsx

  genre/
    page.tsx
    [slug]/
      page.tsx

  search/
    page.tsx

components/
  Navbar.tsx
  ComicCard.tsx
  ComicGrid.tsx
  ChapterList.tsx
  Pagination.tsx
  PustakaFilters.tsx
  ThemeProvider.tsx
  ThemeToggle.tsx

lib/
  api.ts
  utils.ts
  reading-history.ts

types/
  comic.ts

public/
  faruscan-logo.png
  hero-bg.png