import { z } from "zod";
export const validName = (value: string) =>
  value.trim().length >= 2 && value.trim().length <= 120;
export const validEmail = (value: string) =>
  z.string().email().max(254).safeParse(value.trim()).success;
export const validNewPassword = (value: string) =>
  value.length >= 10 && value.length <= 128 && value.trim().length > 0;
export function validTimezone(value: string) {
  try {
    new Intl.DateTimeFormat("en", { timeZone: value });
    return Boolean(value.trim());
  } catch {
    return false;
  }
}
export function sameOriginMutation(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true; // Non-browser clients still require a valid authenticated session.
  try {
    const target = new URL(request.url);
    const expected = request.headers.get("host") || target.host;
    return (
      origin === target.origin || origin === `${target.protocol}//${expected}`
    );
  } catch {
    return false;
  }
}
