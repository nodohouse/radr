import { Suspense } from "react";
import ChecksClient from "./ChecksClient";

export default function ChecksPage() {
  return (
    <Suspense fallback={<div className="rp-checks-page"><p className="rp-muted">Loading checks…</p></div>}>
      <ChecksClient />
    </Suspense>
  );
}
