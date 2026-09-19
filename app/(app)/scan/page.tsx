import { redirect } from "next/navigation";

export default function LegacyScanRedirect() {
  redirect("/app/data");
}
