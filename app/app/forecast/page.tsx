import { redirect } from "next/navigation";

/** Forecasts belong to the scoped Decision workbench, across both worlds. */
export default function ForecastPage() {
  redirect("/app/intelligence?analysis=futures");
}
