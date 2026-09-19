import { redirect } from "next/navigation";

export default function LegacyMoneyRedirect() {
  redirect("/app/value");
}
