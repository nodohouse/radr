import { redirect } from "next/navigation";

/** Legacy control page - product lives at /app. */
export default function LegacyHomeRedirect() {
  redirect("/app");
}
