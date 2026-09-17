import { notFound } from "next/navigation";
import { DecisionDetail } from "@/components/lab/DecisionDetail";
import { getDecision } from "@/lib/lab/world";

export default async function DecisionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!getDecision(id)) notFound();
  return <DecisionDetail id={id} />;
}
