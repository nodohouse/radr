import { redirect } from "next/navigation";

/** Canonical source-health surface is /app/integrations. */
export default function DataRedirect() {
  redirect("/app/integrations");
}
