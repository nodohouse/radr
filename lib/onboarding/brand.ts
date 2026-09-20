/**
 * Personalized demo brand overlay (client).
 * Synthetic data stays Northstar underneath - names are display-only.
 */

import type { WorkspaceBrand } from "./types";

export const BRAND_KEY = "radr.workspaceBrand.v1";

export function readWorkspaceBrand(): WorkspaceBrand | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(BRAND_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WorkspaceBrand;
    if (!parsed?.orgName || !parsed?.locationName) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeWorkspaceBrand(brand: WorkspaceBrand): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(BRAND_KEY, JSON.stringify(brand));
  // Cookie helps first paint for personalized chrome
  document.cookie = `radr_brand=${encodeURIComponent(
    JSON.stringify({
      orgName: brand.orgName,
      locationName: brand.locationName,
      demo: brand.demo,
    }),
  )}; path=/; max-age=31536000; SameSite=Lax`;
}

export function clearWorkspaceBrand(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(BRAND_KEY);
  document.cookie = "radr_brand=; path=/; max-age=0";
}

export function displayOrgName(fallback = "Northstar Hospitality Group"): string {
  return readWorkspaceBrand()?.orgName ?? fallback;
}

export function displayPrimaryLocation(fallback = "Berlin Mitte"): string {
  return readWorkspaceBrand()?.locationName ?? fallback;
}
