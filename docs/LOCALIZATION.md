# RADR localization

Practical guide for marketing site i18n (next-intl) and preparing the product app for the same locales. Canonical UI copy lives under `locales/`. Approved product terms: [RADR_GLOSSARY.md](./RADR_GLOSSARY.md).

## Supported locales

| Code | Language | URL | Native label (`localeNames`) |
|------|----------|-----|------------------------------|
| `en` | English (default) | `/en/…` | English |
| `de` | German | `/de/…` | Deutsch |
| `nl` | Dutch | `/nl/…` | Nederlands |
| `fr` | French | `/fr/…` | Français |
| `es` | Spanish | `/es/…` | Español |

Source of truth: `i18n/routing.ts` (`locales`, `defaultLocale: "en"`).

## Routing

- Library: **next-intl** (App Router), plugin path `./i18n/request.ts` in `next.config.ts`.
- Locale segment: `app/[locale]/…` for marketing, legal, and auth-adjacent pages.
- **`localePrefix: "always"`** — every locale is prefixed (`/en`, `/de`, …). Root `/` redirects once to `/en` (or the detected/cookie locale).
- Why not `as-needed` (unprefixed English): middleware rewrites of `/` → `/en` can leak as `307 Location: /` under some `next start` builds, which browsers report as **ERR_TOO_MANY_REDIRECTS (-310)**.
- Cookie: **`radr_locale`** (1 year). Used for preference persistence and for redirecting unauthenticated users from product routes to the matching login URL (`middleware.ts`).
- Locale detection: enabled (`localeDetection: true`).
- Navigation helpers: `Link`, `redirect`, `usePathname`, `useRouter`, `getPathname` from `@/i18n/navigation` (preserve locale when changing routes).

### Non-localized paths

These stay **outside** locale routing today (`NON_LOCALIZED_PREFIXES` in `i18n/routing.ts`):

`/api`, `/app`, `/home`, `/scan`, `/sources`, `/cases`, `/money`, `/controls`, `/documents`, `/onboarding`, `/dev`

Product and auth-gated shells still respect `radr_locale` for login redirects, but UI strings there are not yet wired through next-intl. See [Product app preparation](#product-app-preparation).

## Translation file structure

```
locales/
  en/
    common.json
    navigation.json
    homepage.json
    …
  de/
    …
  nl/ fr/ es/
```

Path pattern: **`locales/{locale}/{namespace}.json`**.

Messages are loaded in `i18n/request.ts`: every namespace is imported for the active locale; on missing file, that namespace falls back to English.

### Namespaces

| Namespace | Role |
|-----------|------|
| `common` | Brand, territories, shared CTAs, language UI, copyright |
| `navigation` | Nav + footer labels |
| `homepage` | Marketing homepage sections |
| `product` | Product marketing page |
| `solutions` | Solutions |
| `how` | How it works |
| `pricing` | Pricing |
| `company` | Company / about surfaces |
| `developers` | Developers marketing |
| `auth` | Login / signup adjacent copy |
| `onboarding` | Onboarding marketing copy |
| `legal` | Privacy / terms / imprint chrome + convenience notice |
| `errors` | Error / not-found |
| `meta` | Default site title & description |

Usage in components:

```ts
const t = useTranslations("homepage");
t("hero.lead");
```

Nested keys use dot paths matching JSON structure.

## Adding a language

1. Add the code to `locales` in `i18n/routing.ts` and a native name in `localeNames`.
2. Map BCP-47 in `i18n/format.ts` (`BCP47`).
3. Create `locales/{code}/` and copy **all** namespace JSON files from `en/`, then translate.
4. Extend middleware matcher if needed (`/(de|nl|fr|es)/:path*` today).
5. Extend sitemap / metadata `alternates.languages` (`app/sitemap.ts`, `app/[locale]/layout.tsx`).
6. Confirm Open Graph locale mapping in `generateMetadata`.
7. Update [RADR_GLOSSARY.md](./RADR_GLOSSARY.md) for any new approved terms.
8. Smoke-test: `/en` URLs, other locale prefixes, language switcher, cookie, login redirect from a product path.

Do not ship a partial locale: every namespace file must exist (or English will load for that namespace — still better than raw keys, but incomplete UX).

## Adding keys

1. Add the key first to **`locales/en/{namespace}.json`** (English is source of truth).
2. Add the same key path to **de, nl, fr, es** in the same commit when possible.
3. Use the glossary for product nouns; do not invent alternate brand wording.
4. Prefer ICU-friendly placeholders already used (`{year}`, etc.).
5. Keep nesting shallow and consistent with sibling locales.

If a key is missing in a non-English file but present in English, runtime still depends on how the message tree was loaded: **missing namespaces** fall back to EN; **missing keys inside a loaded tree** must not be left to surface as raw key paths — keep trees in sync, or merge English defaults when extending loaders.

## Fallback policy

- Invalid / unknown locale → **`en`**.
- Missing namespace file for a locale → load **`locales/en/{namespace}.json`**.
- **Never show raw keys** in the UI (e.g. `homepage.hero.lead`). English copy is the safety net.
- Prefer failing CI / review on key drift over silent key leakage.

## Number, currency, date, time

Use helpers in **`i18n/format.ts`**. Do not format money with `toLocaleString` ad hoc in components.

**Language ≠ currency.** UI locale controls separators and date/time conventions; money always takes an **explicit ISO currency** (e.g. `EUR`, `GBP`). A German UI can still show GBP for a London location.

| Helper | Purpose |
|--------|---------|
| `localeToBcp47` | `en` → `en-GB`, `de` → `de-DE`, … |
| `formatMoney` | Currency; pass `currency` always |
| `formatCompactCurrency` | Compact money (demo default `EUR`) |
| `formatNumber` | Plain numbers |
| `formatPercent` | Percents |
| `formatDate` | Day / short month / year (override opts as needed) |
| `formatTime` | **24h** across locales (hospitality ops) |

Operational amounts should follow venue currency from data (see also `docs/developers/architecture/currencies.md`). Do not silently convert.

## SEO

- **`html lang`**: set from active locale in `app/[locale]/layout.tsx`.
- **hreflang / alternates**: `metadata.alternates.languages` includes `en`, `de`, `nl`, `fr`, `es`, and `x-default` → English (`https://radrup.com`).
- **Canonical per locale**: sitemap emits one URL per locale × path with `alternates.languages` pointing at all siblings (`app/sitemap.ts`). English: `https://radrup.com{path}`; others: `https://radrup.com/{locale}{path}`.
- Sitemap covers public marketing / legal / auth-adjacent paths only — **not** `/app`, `/home`, onboarding, or admin.
- Per-page titles/descriptions: prefer namespace `metaTitle` / `metaDescription` (or `meta` defaults) via `generateMetadata`.

When adding a public page, add it to `PATHS` in `app/sitemap.ts` and ensure locale-aware metadata.

## Legal translation policy

Legal pages may show localized chrome and a **convenience translation**.

- Authoritative legal text remains **English** until a professionally reviewed translation is published.
- Always surface `legal.convenienceNotice` and link via `legal.officialEn` to the English version.
- Do not present convenience copy as binding in DE/NL/FR/ES.

## Product terminology (do not translate)

Keep these **identical** in all locales (labels, nav, kickers, product chrome):

- **RADR**
- **Ask RADR**
- **BUY**, **LABOR**, **SELL**, **RECOVER**
- **Verified Value**
- **Control Center**
- **Morning Brief**

Surrounding sentence grammar may localize; the product noun stays English. Full table: [RADR_GLOSSARY.md](./RADR_GLOSSARY.md).

## Homepage hero transcreation

English keeps the line break brand play:

- Line 1: `Nothing off`
- Line 2 prefix: `the` + RADR wordmark

Other locales **do not** mirror English grammar when it reads awkward. Prefer a concise premium equivalent that keeps RADR recognizable:

| Locale | Approach (see `homepage.hero`) |
|--------|--------------------------------|
| EN | Nothing off / the R△DR |
| DE | Nichts geht am / R△DR (empty prefix) |
| NL | Niets buiten / de R△DR |
| FR | Rien n'échappe / au R△DR |
| ES | Nada fuera / del R△DR |

Document new hero lines in this table when copy changes.

## Butler / Ask RADR

| Layer | Status |
|-------|--------|
| Marketing UI chrome (labels, sample Q&A strings in locale JSON) | Localized now |
| Product Ask RADR shell (panel labels, placeholders) | Prepare with same locales; do not hardcode EN when wiring i18n |
| Live LLM answers | **Not** multilingual until the backend explicitly accepts questions in all five languages and responds in the **active locale** |

Rules:

- Do **not** fake multilingual AI (client-side translation of answers, or pretending the model is locale-aware) if the OpenAI / Butler path is not connected for that locale.
- When the model is wired: pass active `AppLocale` (or BCP-47) into the request; accept user questions in en/de/nl/fr/es; answer in the active locale; keep product nouns untranslated per glossary.
- Until then: localized static UI + honest unavailable / demo behavior is correct.

## Footer language selector

- Component: `components/marketing/LanguageSwitcher.tsx` in `SiteFooter`.
- Lists **native language names** from `localeNames` — **no flags**.
- Switching calls `router.replace(pathname, { locale })` so the current path is preserved.
- Preference is stored via the `radr_locale` cookie (next-intl).

## Product app preparation

Goal: same five locales and glossary rules inside `/app` (and related shells), without breaking today’s unprefixed product URLs until you choose a migration.

Recommended approach:

1. Reuse `locales/*` namespaces (or add `app` / `product-ui` namespaces) and `i18n/format.ts`.
2. Keep **LANGUAGE ≠ CURRENCY** for multi-location money.
3. Prefer reading `radr_locale` (and later optional path prefix) so marketing preference carries into the product.
4. Localize chrome first (nav, Morning Brief labels, empty states); keep brand terms fixed.
5. Ask RADR: localize UI only until the model contract is ready (see above).
6. When enabling prefixed product routes, update `NON_LOCALIZED_PREFIXES`, middleware matcher, and auth redirects carefully — do not half-migrate.

**Stub in product settings:** `/app/settings` lists a Language row (`PREP`) that documents the marketing `radr_locale` cookie. Do not fully translate `/app` UI until a dedicated product namespace and LanguagePreference control land. Optional component name when wiring: `LanguagePreference` (read/write `radr_locale`, reuse `localeNames` from `i18n/routing.ts`).

Until product strings move to JSON, treat English product chrome as temporary, not a second glossary.

### Validation

- `npm run i18n:check` — DE/NL/FR/ES key trees must match EN (`scripts/check-locale-parity.mjs`).
- `tests/i18n-routes.test.ts` — routing locales, `buildAlternates` / `buildAlternatesForLocale`, and message parity (no network).
- SEO helper: `i18n/seo.ts` (`buildAlternates`, `buildAlternatesForLocale`) for per-page `generateMetadata`.

## Type safety and validation

Current expectations:

| Mechanism | Expectation |
|-----------|-------------|
| `AppLocale` | Union from `locales` in `i18n/routing.ts` — use instead of bare `string` |
| Namespace list | Keep `namespaces` in `i18n/request.ts` aligned with files on disk |
| Key parity | Every key in `en` should exist in de/nl/fr/es for that namespace |
| Format helpers | Typed with `AppLocale`; currency always explicit for money |
| `hasLocale` | Reject unknown `[locale]` segments → `notFound()` |

Recommended hardening (when you invest):

- Generate TypeScript message types from English JSON (next-intl typed messages) so `useTranslations('homepage')('…')` is checked.
- CI script: fail if non-EN locales miss keys or contain leftover raw English where translation is required (allowlist brand nouns).
- Optional runtime `getMessageFallback` that returns English string, never the key path.

## Quick reference — key files

| File | Role |
|------|------|
| `i18n/routing.ts` | Locales, cookie, prefix mode, non-localized prefixes |
| `i18n/request.ts` | Message loading + EN namespace fallback |
| `i18n/navigation.ts` | Locale-aware Link / router |
| `i18n/format.ts` | Number / money / date / time |
| `middleware.ts` | intl + auth + `radr_locale` login redirect |
| `app/sitemap.ts` | Localized URLs + hreflang map |
| `app/[locale]/layout.tsx` | Provider, `lang`, metadata alternates |
| `components/marketing/LanguageSwitcher.tsx` | Footer selector |
| `locales/**` | Copy |
| `docs/RADR_GLOSSARY.md` | Approved terminology |
