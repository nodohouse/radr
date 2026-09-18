import { redirect } from "next/navigation";

/** Alias retired - Performance folds into Forecast. */
export default function PerformanceRedirect() {
  redirect("/app/forecast");
}
