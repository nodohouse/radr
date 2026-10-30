import { redirect } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

/** Legacy signal detail → Decision Ledger (customer vocabulary). */
export default async function SignalDetailRedirect({ params }: Props) {
  await params;
  redirect("/app/decisions");
}
