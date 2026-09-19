import { redirect } from "next/navigation";

/** Legacy Needs-you path → Decision Ledger attention filter. */
export default function FindingsRedirect() {
  redirect("/app/decisions?band=needs_you");
}
