import { redirect } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

/** Legacy control detail → Decision Ledger. */
export default async function ControlDetailRedirect({ params }: Props) {
  await params;
  redirect("/app/decisions?band=needs_you");
}
