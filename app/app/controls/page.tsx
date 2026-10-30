import { redirect } from "next/navigation";

/** Legacy Actions/Controls cockpit → Decision Ledger. */
export default function ControlsRedirectPage() {
  redirect("/app/decisions?band=needs_you");
}
