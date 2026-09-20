import { redirect } from "next/navigation";

export default function LegacySourcesRedirect() {
  redirect("/app/data");
}
