import { redirect } from "next/navigation";

export default function LegacyControlsRedirect() {
  redirect("/app/controls");
}
