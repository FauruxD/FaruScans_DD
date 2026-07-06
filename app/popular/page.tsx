import { redirect } from "next/navigation";

export default async function LegacyPopularPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>;
}) {
  const params = await searchParams;
  const page = Array.isArray(params.page) ? params.page[0] : params.page;
  redirect(page && page !== "1" ? `/populer?page=${page}` : "/populer");
}
