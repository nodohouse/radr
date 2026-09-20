# RADR glossary (EN / DE / NL / FR / ES)

Approved terminology for marketing and product UI. Sourced from `locales/{locale}/*.json` — do not invent conflicting alternatives.

Tone: professional B2B hospitality / finance. Prefer the locale files’ existing voice (direct, operational, no marketing fluff).

Related: [LOCALIZATION.md](./LOCALIZATION.md).

---

## How to use this table

- **Brand / product nouns** marked *keep* stay identical in every locale.
- **Short descriptions** localize; the territory **code** (BUY, …) does not.
- When prose needs a verb around a product noun, keep the noun English (e.g. “Demo Control Center öffnen”).
- Numbers and currency formatting are not glossary items — use `i18n/format.ts` (language ≠ currency).

---

## Brand terms (do not translate)

| Concept | EN | DE | NL | FR | ES |
|---------|----|----|----|----|-----|
| Product name | RADR | RADR | RADR | RADR | RADR |
| Ask surface | Ask RADR | Ask RADR | Ask RADR | Ask RADR | Ask RADR |
| Territory | BUY | BUY | BUY | BUY | BUY |
| Territory | LABOR | LABOR | LABOR | LABOR | LABOR |
| Territory | SELL | SELL | SELL | SELL | SELL |
| Territory | RECOVER | RECOVER | RECOVER | RECOVER | RECOVER |
| Verified outcome | Verified Value | Verified Value | Verified Value | Verified Value | Verified Value |
| Primary shell | Control Center | Control Center | Control Center | Control Center | Control Center |
| Daily brief | Morning Brief | Morning Brief | Morning Brief | Morning Brief | Morning Brief |

`common.json` stores these under `brand`, `askRadr`, `territories.*`, `verifiedValue`, `controlCenter`, `morningBrief`.

**Slogan** (localized; brand name stays RADR):

| EN | DE | NL | FR | ES |
|----|----|----|----|-----|
| Nothing off the RADR. | Nichts geht am RADR vorbei. | Niets buiten de RADR. | Rien n'échappe au RADR. | Nada fuera del RADR. |

**Tagline**:

| EN | DE | NL | FR | ES |
|----|----|----|----|-----|
| Margin intelligence | Margenintelligenz | Marge-intelligentie | Intelligence de marge | Inteligencia de margen |

---

## Territories — short descriptions

Territory **labels** stay BUY / LABOR / SELL / RECOVER. Descriptions from `homepage.territories.*.title`:

| Territory | EN | DE | NL | FR | ES |
|-----------|----|----|----|----|-----|
| BUY | What you spend. | Was Sie ausgeben. | Wat u uitgeeft. | Ce que vous dépensez. | Lo que gasta. |
| LABOR | How you staff. | Wie Sie besetzen. | Hoe u bezet. | Comment vous staffez. | Cómo cubre el personal. |
| SELL | How you monetize. | Wie Sie monetarisieren. | Hoe u monetariseert. | Comment vous monétisez. | Cómo monetiza. |
| RECOVER | What you are owed. | Was Ihnen zusteht. | Wat u nog toekomt. | Ce qui vous est dû. | Lo que le deben. |

Point lists (supplier pricing, scheduling, cancellations, etc.) live in `homepage.territories.*.points` — mirror those files when editing.

---

## Product system terms

| Concept | EN | DE | NL | FR | ES | Notes |
|---------|----|----|----|----|-----|--------|
| Control Center | Control Center | Control Center | Control Center | Control Center | Control Center | *Keep* |
| Morning Brief | Morning Brief | Morning Brief | Morning Brief | Morning Brief | Morning Brief | *Keep* |
| Verified Value | Verified Value | Verified Value | Verified Value | Verified Value | Verified Value | *Keep* as product name. Running copy may say “verifizierter Wert” / “valeur vérifiée” / etc. when describing the idea — product chrome and `common.verifiedValue` stay English. |
| Ask RADR | Ask RADR | Ask RADR | Ask RADR | Ask RADR | Ask RADR | *Keep* |
| Findings | Findings | Findings | findings | findings | findings | Product noun stays English (see `how` + `homepage.control.topFindings`). UI label style: “Top findings” → “Wichtigste Findings” / “Belangrijkste findings” / “Findings prioritaires” / “Findings prioritarios”. |
| Actions | Actions | Maßnahmen *(prose)* / Actions *(nav)* | acties *(prose)* / Actions *(nav)* | actions *(prose)* / Actions *(nav)* | acciones *(prose)* / Actions *(nav)* | Product nav label **Actions** stays English until product i18n ships. Sentence-level verbs/nouns follow locale files (`Maßnahme prüfen`, `Actie bekijken`, …). |
| Forecast | Forecast | Forecast | Forecast | Forecast | Forecast | Product surface label stays English (aligned with current product nav). Do not substitute “Prognose” / “prévision” as the nav title. |

---

## Hospitality / ops terms

From homepage tables and territory examples:

| Concept | EN | DE | NL | FR | ES |
|---------|----|----|----|----|-----|
| Covers | Covers | Covers | Covers | Couverts | Cubiertos |
| Waitlist | waitlist | Warteliste | wachtlijst | liste d'attente | lista de espera |
| Service *(service period)* | service | Service | service | service | servicio |
| Location | Location | Standort | Locatie | Établissement | Local |
| Margin | Margin | Marge | Marge | Marge | Margen |
| Exposure | Exposure | Exposure | exposure | exposition | exposición |

Notes:

- **Covers**: DE/NL keep the English hospitality term in table headers; FR/ES use local equivalents.
- **Exposure**: DE/NL often keep “Exposure” in compounds (`Exposure-Trend`); FR/ES translate (`exposition` / `exposición`).
- **Labor** as a column/category next to territories may remain **Labor** (English) in tables — see `homepage.locations.headers.labor` across locales.

Related money labels (for consistency, not brand nouns):

| Concept | EN | DE | NL | FR | ES |
|---------|----|----|----|----|-----|
| Value at risk | Value at risk | Wert gefährdet | Waarde in gevaar | Valeur à risque | Valor en riesgo |
| Revenue | Revenue | Umsatz | Omzet | CA | Ingresos |

---

## CTAs

From `common.json` / `navigation.json` / homepage finals:

| CTA | EN | DE | NL | FR | ES |
|-----|----|----|----|----|-----|
| See RADR | See RADR | RADR ansehen | Bekijk RADR | Voir RADR | Ver RADR |
| See RADR in action | See RADR in action | RADR in Aktion sehen | Zie RADR in actie | Voir RADR en action | Ver RADR en acción |
| Request access | Request access | Zugang anfragen | Vraag toegang aan | Demander l'accès | Solicitar acceso |
| Sign in | Sign in | Anmelden | Inloggen | Connexion | Iniciar sesión |
| Explore the product | Explore the product | Produkt entdecken | Ontdek het product | Explorer le produit | Explorar el producto |

Use these strings via `useTranslations("common")` / `navigation` — do not hardcode variants.

---

## Language selector labels

Footer selector shows **native names**, never flags (`localeNames` in `i18n/routing.ts`):

| Code | Label |
|------|--------|
| en | English |
| de | Deutsch |
| nl | Nederlands |
| fr | Français |
| es | Español |

UI chrome: `common.language` / `common.languageMenu` (Language / Sprache / Taal / Langue / Idioma).

---

## Legal chrome (convenience vs authoritative)

| Key | EN | DE | NL | FR | ES |
|-----|----|----|----|----|-----|
| Privacy title | Privacy | Datenschutz | Privacy | Confidentialité | Privacidad |
| Terms title | Terms | AGB | Voorwaarden | Conditions | Términos |
| Imprint title | Imprint | Impressum | Colofon | Mentions légales | Aviso legal |
| Official EN link | View English (authoritative) | Englisch ansehen (maßgeblich) | Bekijk Engels (gezaghebbend) | Voir l'anglais (faisant foi) | Ver inglés (autoritativo) |

Always pair localized legal pages with `legal.convenienceNotice`. English remains authoritative until a reviewed translation is published.

---

## Maintenance

1. Change English in `locales/en/` first, then update DE/NL/FR/ES in the same change when possible.
2. If you add a **brand noun**, add it here as *keep* and to `common.json` for all locales with the English value.
3. Prefer existing glossary rows over near-synonyms (“Standort” vs “Location” labels are already fixed per locale — don’t mix).
4. Ask RADR / Butler answers must follow the same noun rules when multilingual backend lands; until then, do not invent parallel AI glossaries.
