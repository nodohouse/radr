import { redirect } from "next/navigation";

/** Legacy route — Connections is the customer-facing name. */
export default function IntegrationsRedirect() {
  redirect("/app/connections");
}
