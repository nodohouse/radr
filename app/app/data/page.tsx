import { redirect } from "next/navigation";

/** Canonical source-health surface is /app/connections. */
export default function DataRedirect() {
  redirect("/app/connections");
}
