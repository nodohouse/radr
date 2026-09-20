import { redirect } from "next/navigation";

export default function LegacyCasesRedirect() {
  redirect("/app/findings");
}
