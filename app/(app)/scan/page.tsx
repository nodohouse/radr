import { redirect } from "next/navigation";

/** Legacy route — Sources is the product name. */
export default function ScanRedirectPage() {
  redirect("/sources");
}
