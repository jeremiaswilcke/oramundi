import { BibleReader } from "@/components/bible-reader";

export default async function BibleReadPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const params = await searchParams;
  const requestedDay = Number.parseInt(params.tag ?? "", 10);
  const initialDay = Number.isFinite(requestedDay) ? Math.min(Math.max(requestedDay, 1), 365) : null;

  return <BibleReader initialDay={initialDay} />;
}
