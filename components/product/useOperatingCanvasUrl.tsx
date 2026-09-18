"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useProduct } from "@/lib/product/store";
import {
  parseCanvasFromSearchParams,
  writeCanvasSearchParams,
} from "@/lib/radr/operatingCanvas";

/**
 * Sync lens / serviceTime / selectedFindingId with URL search params.
 * URL wins on first hydrate when params present; thereafter store drives URL.
 * Never resets location or period.
 */
export function useOperatingCanvasUrl() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    lens,
    serviceTime,
    selectedFindingId,
    setLens,
    setServiceTime,
    setSelectedFindingId,
  } = useProduct();
  const appliedUrl = useRef(false);
  const skipWrite = useRef(false);

  useEffect(() => {
    if (appliedUrl.current) return;
    appliedUrl.current = true;
    const fromUrl = parseCanvasFromSearchParams(searchParams);
    if (
      fromUrl.lens ||
      fromUrl.serviceTime ||
      fromUrl.selectedFindingId !== undefined
    ) {
      skipWrite.current = true;
      if (fromUrl.lens) setLens(fromUrl.lens);
      if (fromUrl.serviceTime) setServiceTime(fromUrl.serviceTime);
      if (fromUrl.selectedFindingId !== undefined) {
        setSelectedFindingId(fromUrl.selectedFindingId);
      }
      queueMicrotask(() => {
        skipWrite.current = false;
      });
    }
  }, [searchParams, setLens, setServiceTime, setSelectedFindingId]);

  useEffect(() => {
    if (!appliedUrl.current || skipWrite.current) return;
    const next = writeCanvasSearchParams(searchParams, {
      lens,
      serviceTime,
      selectedFindingId,
    });
    const nextStr = next.toString();
    const curStr = searchParams.toString();
    if (nextStr === curStr) return;
    const href = nextStr ? `${pathname}?${nextStr}` : pathname;
    router.replace(href, { scroll: false });
  }, [
    lens,
    serviceTime,
    selectedFindingId,
    pathname,
    router,
    searchParams,
  ]);
}

/** Suspense-safe wrapper that runs the URL sync hook. */
export function OperatingCanvasUrlSync() {
  useOperatingCanvasUrl();
  return null;
}
