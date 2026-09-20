import { redirect } from "next/navigation";

/** Signals catalog retired - canonical intelligence object is Finding. */
export default function SignalsRedirectPage() {
  redirect("/app/findings");
}
