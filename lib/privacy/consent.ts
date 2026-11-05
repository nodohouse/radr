export const CONSENT_KEY = "radr.cookie-preferences.v1";
export type CookiePreferences = {
  version: 1;
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  savedAt: string;
};
export function parsePreferences(
  value: string | null,
): CookiePreferences | null {
  try {
    const p = JSON.parse(value || "null");
    return p?.version === 1 &&
      p.necessary === true &&
      typeof p.analytics === "boolean" &&
      typeof p.marketing === "boolean" &&
      typeof p.savedAt === "string" &&
      Number.isFinite(Date.parse(p.savedAt)) &&
      Date.now() - Date.parse(p.savedAt) < 180 * 86400000 &&
      Date.parse(p.savedAt) <= Date.now() + 60000
      ? p
      : null;
  } catch {
    return null;
  }
}
let storageWriteFailed = false;
export function savePreferences(value: CookiePreferences) {
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(value));
    storageWriteFailed = false;
  } catch (error) {
    storageWriteFailed = true;
    throw error;
  }
}
export function analyticsAllowed() {
  if (typeof window === "undefined" || storageWriteFailed) return false;
  try {
    return (
      parsePreferences(localStorage.getItem(CONSENT_KEY))?.analytics === true
    );
  } catch {
    return false;
  }
}

// Dismissal is a tab-level UI choice, never permission for optional tracking.
export const CONSENT_PROMPT_KEY = "radr.cookie-prompt-dismissed.v1";
let promptDismissedInThisTab = false;
export function dismissCookiePrompt() {
  promptDismissedInThisTab = true;
  try {
    sessionStorage.setItem(CONSENT_PROMPT_KEY, "1");
  } catch {
    /* In-memory dismissal still works for client navigation. */
  }
}
export function cookiePromptDismissed() {
  if (promptDismissedInThisTab) return true;
  try {
    return sessionStorage.getItem(CONSENT_PROMPT_KEY) === "1";
  } catch {
    return false;
  }
}
