import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

// Re-export for next-intl plugin path clarity
export { default } from "./request";
export { routing, locales, localeNames, type AppLocale } from "./routing";
export {
  Link,
  redirect,
  usePathname,
  useRouter,
  getPathname,
} from "./navigation";

void hasLocale;
void getRequestConfig;
void routing;
