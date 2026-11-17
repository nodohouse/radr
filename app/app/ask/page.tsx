"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAskRadr } from "@/components/product/ask/AskRadrContext";

/** Older links open the same scoped Ask RADR as the workspace command bar. */
export default function AskPage() {
  const router = useRouter();
  const search = useSearchParams();
  const { openAsk } = useAskRadr();
  const opened = useRef(false);
  useEffect(() => {
    if (opened.current) return;
    opened.current = true;
    const query = (search.get("q") ?? "").trim().slice(0, 2000);
    openAsk(query ? { query, autoAsk: true } : undefined);
    router.replace("/app", { scroll: false });
  }, [openAsk, router, search]);
  return <div className="rs-page" role="status">Opening Ask RADR…</div>;
}
