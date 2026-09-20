import { redirect } from "next/navigation";

/** Alias retired - team lives under Settings. */
export default function TeamRedirect() {
  redirect("/app/settings");
}
