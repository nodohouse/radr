import { redirect } from "next/navigation";

/**
 * Canonical hotel Operations alias → /app/service.
 * Hotel vertical renders HouseReadinessShell; restaurant keeps ServiceShell.
 */
export default function OperationsAliasPage() {
  redirect("/app/service");
}
