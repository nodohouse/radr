import { redirect } from "next/navigation";

export default function LegacyDocumentDetailRedirect() {
  redirect("/app/data");
}
