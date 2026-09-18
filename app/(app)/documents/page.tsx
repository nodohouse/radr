import { redirect } from "next/navigation";

export default function LegacyDocumentsRedirect() {
  redirect("/app/data");
}
