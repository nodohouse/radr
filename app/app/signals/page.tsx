import { redirect } from "next/navigation";

/** Signals catalog retired — Decision Ledger is the customer object. */
export default function SignalsRedirectPage() {
  redirect("/app/decisions");
}
