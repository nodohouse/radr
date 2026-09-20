"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  INTEGRATION_PROVIDERS,
  type DataEntity,
  type IntegrationCategory,
  type IntegrationProvider,
  type IntegrationStatus,
} from "@/lib/integrations/registry";
import { shortBlurb } from "@/lib/integrations/providerDetails";

const CATEGORIES: Array<IntegrationCategory | "all"> = [
  "all",
  "pos",
  "reservations",
  "pms",
  "channels",
  "aparthotel",
  "labor",
  "accounting",
  "payments",
  "delivery",
  "purchasing",
  "banking",
  "external-signals",
  "custom",
];

const STATUSES: Array<IntegrationStatus | "all"> = [
  "all",
  "available",
  "beta",
  "partner_access",
  "building",
  "planned",
  "custom",
];

const CAPABILITIES: Array<DataEntity | "all"> = [
  "all",
  "orders",
  "payments",
  "reservations",
  "waitlist",
  "tables",
  "labor",
  "invoices",
  "payouts",
  "locations",
  "files",
];

const REGIONS = ["all", "global", "eu", "uk", "us", "ca", "other"] as const;

const LEGEND_STATUSES: IntegrationStatus[] = [
  "available",
  "beta",
  "partner_access",
  "building",
  "planned",
  "custom",
];

function matchesQuery(p: IntegrationProvider, q: string): boolean {
  if (!q) return true;
  const hay = [
    p.name,
    p.category,
    p.status,
    p.accessType,
    ...p.dataEntities,
    ...p.capabilities,
    p.notes ?? "",
  ]
    .join(" ")
    .toLowerCase();
  return hay.includes(q.toLowerCase());
}

function ProviderCard({ p }: { p: IntegrationProvider }) {
  const t = useTranslations("developers");
  return (
    <Link
      href={`/developers/integrations/${p.id}`}
      className="rx-dev-card rx-dev-card-link"
      data-status={p.status}
    >
      <header className="rx-dev-card-head">
        <h3>{p.name}</h3>
        <span className="rx-dev-status">{t(`labels.status.${p.status}`)}</span>
      </header>
      <p className="rx-dev-card-cat">{t(`labels.category.${p.category}`)}</p>
      <ul className="rx-dev-card-ents">
        {p.dataEntities.slice(0, 5).map((e) => (
          <li key={e}>{t(`labels.entity.${e}`)}</li>
        ))}
      </ul>
      <p className="rx-dev-card-note">{shortBlurb(p)}</p>
      <span className="rx-dev-card-cta">{t("catalog.viewIntegration")}</span>
    </Link>
  );
}

export function IntegrationsCatalog() {
  const t = useTranslations("developers");
  const [q, setQ] = useState("");
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("all");
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("all");
  const [capability, setCapability] =
    useState<(typeof CAPABILITIES)[number]>("all");
  const [region, setRegion] = useState<(typeof REGIONS)[number]>("all");

  const filtered = useMemo(() => {
    return INTEGRATION_PROVIDERS.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (status !== "all" && p.status !== status) return false;
      if (
        capability !== "all" &&
        !p.dataEntities.includes(capability) &&
        !p.capabilities.includes(capability)
      ) {
        return false;
      }
      if (region !== "all" && !p.regions.includes(region)) return false;
      return matchesQuery(p, q.trim());
    });
  }, [q, category, status, capability, region]);

  return (
    <div className="rx-dev-catalog" id="integrations">
      <div className="rx-dev-filters">
        <label className="rx-dev-search">
          <span className="sr-only">{t("catalog.searchLabel")}</span>
          <input
            type="search"
            placeholder={t("catalog.searchPlaceholder")}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </label>
        <div className="rx-dev-filter-row">
          <label>
            {t("catalog.category")}
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as (typeof CATEGORIES)[number])
              }
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c === "all" ? t("catalog.all") : t(`labels.category.${c}`)}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t("catalog.status")}
            <select
              value={status}
              onChange={(e) =>
                setStatus(e.target.value as (typeof STATUSES)[number])
              }
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s === "all" ? t("catalog.all") : t(`labels.status.${s}`)}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t("catalog.capability")}
            <select
              value={capability}
              onChange={(e) =>
                setCapability(e.target.value as (typeof CAPABILITIES)[number])
              }
            >
              {CAPABILITIES.map((c) => (
                <option key={c} value={c}>
                  {c === "all" ? t("catalog.all") : t(`labels.entity.${c}`)}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t("catalog.region")}
            <select
              value={region}
              onChange={(e) =>
                setRegion(e.target.value as (typeof REGIONS)[number])
              }
            >
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r === "all" ? t("catalog.all") : t(`labels.region.${r}`)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <details className="rx-dev-legend">
        <summary>{t("catalog.legendSummary")}</summary>
        <p className="rx-dev-legend-note">
          Status labels refer to integration availability — not product feature guarantees.
        </p>
        <ul>
          {LEGEND_STATUSES.map((s) => (
            <li key={s}>
              <strong>{t(`labels.status.${s}`)}</strong> ·{" "}
              {t(`labels.legend.${s}`)}
            </li>
          ))}
        </ul>
      </details>

      <Link href="/developers/connectors" className="rx-dev-yoursys">
        <div>
          <p className="rx-dev-yoursys-kicker">{t("catalog.yourSysKicker")}</p>
          <h3>{t("catalog.yourSysTitle")}</h3>
          <p>{t("catalog.yourSysMeta")}</p>
          <p className="rx-dev-card-note">{t("catalog.yourSysNote")}</p>
        </div>
        <span>{t("catalog.buildConnector")}</span>
      </Link>

      <p className="rx-dev-count">{t("catalog.count", { count: filtered.length })}</p>

      <div className="rx-dev-grid">
        {filtered.map((p) => (
          <ProviderCard key={p.id} p={p} />
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="rx-dev-empty">
          {t("catalog.empty")}{" "}
          <Link href="/developers/connectors">{t("catalog.emptyLink")}</Link>.
        </p>
      ) : null}
    </div>
  );
}
