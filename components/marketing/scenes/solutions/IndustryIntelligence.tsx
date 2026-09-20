"use client";

import { useEffect, useId, useState, type KeyboardEvent } from "react";
import { useTranslations } from "next-intl";
import {
  INDUSTRY_ORDER,
  getIndustry,
  primaryFinding,
  type IndustryId,
  type DomainStatus,
} from "@/components/marketing/config/industryIntelligence";

const STATUS_LABEL: Record<DomainStatus, string> = {
  available: "available",
  developing: "developing",
  planned: "planned",
};

function parseIndustryHash(hash: string): IndustryId | null {
  const raw = hash.replace(/^#/, "");
  if (raw === "intelligence" || raw === "operations") return "restaurants";
  if (raw === "groups") return "groups";
  if (raw === "cfo" || raw === "finance") return "groups";
  if (raw === "bars" || raw === "intelligence-bars") return "restaurants";
  if (raw.startsWith("intelligence-")) {
    const id = raw.slice("intelligence-".length) as IndustryId;
    if ((INDUSTRY_ORDER as readonly string[]).includes(id)) return id;
  }
  if ((INDUSTRY_ORDER as readonly string[]).includes(raw)) {
    return raw as IndustryId;
  }
  return null;
}

type Props = {
  /** Skip the section kicker/title/lead when the page already has a hero. */
  hideHead?: boolean;
  /** Homepage mode: core hospitality models only, full section head. */
  homepage?: boolean;
};

const HOMEPAGE_INDUSTRIES = [
  "restaurants",
  "hotels",
  "apartments",
  "groups",
] as const satisfies readonly IndustryId[];

/**
 * Interactive industry intelligence demonstration.
 * One shared panel. Category selection swaps domains, signals, and finding.
 */
export function IndustryIntelligence({
  hideHead = false,
  homepage = false,
}: Props) {
  const t = useTranslations("solutions.intelligence");
  const th = useTranslations("homepage.industries");
  const ti = useTranslations("industries");
  const baseId = useId();
  const order: readonly IndustryId[] = homepage
    ? HOMEPAGE_INDUSTRIES
    : INDUSTRY_ORDER;
  const [active, setActive] = useState<IndustryId>(() => {
    if (typeof window === "undefined") return "restaurants";
    const parsed = parseIndustryHash(window.location.hash);
    if (parsed && (order as readonly string[]).includes(parsed)) return parsed;
    return "restaurants";
  });
  const [findingId, setFindingId] = useState<string | null>(null);
  const showStory = !homepage;

  useEffect(() => {
    const apply = () => {
      const id = parseIndustryHash(window.location.hash);
      if (!id || !(order as readonly string[]).includes(id)) return;
      setActive(id);
      setFindingId(null);
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, [order]);

  const def = getIndustry(active);
  const featured = findingId
    ? (def.findings.find((f) => f.id === findingId) ?? primaryFinding(def))
    : primaryFinding(def);

  function selectIndustry(id: IndustryId) {
    setActive(id);
    setFindingId(null);
    const next = `#intelligence-${id}`;
    if (window.location.hash !== next) {
      window.history.replaceState(null, "", next);
    }
  }

  function onTabKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const i = Math.max(0, order.indexOf(active));
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      e.preventDefault();
      selectIndustry(order[(i + 1) % order.length]!);
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      e.preventDefault();
      selectIndustry(order[(i - 1 + order.length) % order.length]!);
    } else if (e.key === "Home") {
      e.preventDefault();
      selectIndustry(order[0]!);
    } else if (e.key === "End") {
      e.preventDefault();
      selectIndustry(order[order.length - 1]!);
    }
  }

  const showHead = homepage || !hideHead;

  return (
    <section
      className="rx-ii"
      id="intelligence"
      data-nav-theme="light"
      data-compact={hideHead && !homepage ? "true" : undefined}
      aria-labelledby={showHead ? `${baseId}-title` : undefined}
      aria-label={!showHead ? t("tabsLabel") : undefined}
    >
      <div className="rx-shell">
        {showHead ? (
          <header className="rx-ii-head">
            <p className="rx-kicker">
              {homepage ? th("kicker") : t("kicker")}
            </p>
            <h2 className="rx-display rx-display-sm" id={`${baseId}-title`}>
              {homepage ? th("title") : t("title")}
            </h2>
            <p className="rx-lead rx-ii-lead">
              {homepage ? th("lead") : t("lead")}
            </p>
          </header>
        ) : null}

        <div
          className="rx-ii-tabs"
          role="tablist"
          aria-label={t("tabsLabel")}
          onKeyDown={onTabKeyDown}
        >
          {order.map((id) => {
            const selected = id === active;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                id={`${baseId}-tab-${id}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel`}
                tabIndex={selected ? 0 : -1}
                className="rx-ii-tab"
                data-on={selected ? "true" : "false"}
                onClick={() => selectIndustry(id)}
              >
                {t(`categories.${id}.tab`)}
              </button>
            );
          })}
        </div>

        <div
          className="rx-ii-panel"
          role="tabpanel"
          id={`${baseId}-panel`}
          aria-labelledby={`${baseId}-tab-${active}`}
          data-industry={active}
          data-mode={def.mode}
        >
          <div className="rx-ii-copy">
            <h3 className="rx-ii-industry-title">
              {t(`categories.${active}.headline`)}
            </h3>
            <p className="rx-ii-industry-lead">
              {t(`categories.${active}.lead`)}
            </p>
            <p className="rx-ii-industry-edge">
              {t(`categories.${active}.edge`)}
            </p>

            {showStory ? (
              <div className="rx-ii-story" aria-label={ti("storiesLabel")}>
                <p className="rx-ii-label">{ti("storiesLabel")}</p>
                <dl className="rx-ii-story-list">
                  <div>
                    <dt>{ti("problemLabel")}</dt>
                    <dd>{ti(`stories.${active}.problem`)}</dd>
                  </div>
                  <div>
                    <dt>{ti("decisionsLabel")}</dt>
                    <dd>{ti(`stories.${active}.decisions`)}</dd>
                  </div>
                  <div>
                    <dt>{ti("workRemovedLabel")}</dt>
                    <dd>{ti(`stories.${active}.workRemoved`)}</dd>
                  </div>
                  <div>
                    <dt>{ti("exampleLabel")}</dt>
                    <dd>{ti(`stories.${active}.example`)}</dd>
                  </div>
                </dl>
              </div>
            ) : null}

            <div className="rx-ii-domains">
              <p className="rx-ii-label">{t("domainsLabel")}</p>
              <ul className="rx-ii-domain-list">
                {def.dataDomains.map((d) => (
                  <li key={d.id} data-status={d.status}>
                    <span>{t(`domains.${d.id}`)}</span>
                    <em>{t(`status.${STATUS_LABEL[d.status]}`)}</em>
                  </li>
                ))}
              </ul>
              <p className="rx-ii-domains-note">{t("domainsNote")}</p>
            </div>
          </div>

          <div className="rx-prod-stage rx-ii-stage">
            <div className="rx-prod-plate" aria-hidden="true" />
            <article className="rx-prod-board rx-ii-board">
              <div className="rx-prod-chrome">
                <span className="rx-prod-chrome-left">
                  <i aria-hidden="true" />
                  {t("demoChrome")}
                </span>
                <span className="rx-prod-chrome-right">
                  {t(`categories.${active}.tab`)}
                </span>
              </div>

              <div className="rx-prod-body">
                {def.mode === "finding" && (
                  <FindingDemo
                    industry={active}
                    findingId={featured.id}
                    territory={featured.territory}
                    findings={def.findings.map((f) => f.id)}
                    onSelectFinding={setFindingId}
                  />
                )}
                {def.mode === "portfolio" && <PortfolioDemo />}
                {def.mode === "finance" && <FinanceDemo />}
              </div>
            </article>
          </div>
        </div>

        <div className="rx-ii-signals" aria-label={t("signalsLabel")}>
          <p className="rx-ii-label">{t("signalsLabel")}</p>
          <ul className="rx-ii-signal-list" key={active}>
            {def.operatingSignals.map((s) => (
              <li key={s}>{t(`signals.${active}.${s}`)}</li>
            ))}
          </ul>
        </div>

        {def.workRemoved.length > 0 && (
          <div className="rx-ii-work" aria-label={t("workRemovedLabel")}>
            <p className="rx-ii-label">{t("workRemovedLabel")}</p>
            <ul className="rx-ii-work-list" key={`work-${active}`}>
              {def.workRemoved.map((id) => (
                <li key={id}>{t(`workRemoved.${active}.${id}`)}</li>
              ))}
            </ul>
            <p className="rx-ii-work-note">{t("workRemovedNote")}</p>
          </div>
        )}

        <p className="rx-ii-disclaimer">{t("disclaimer")}</p>
      </div>
    </section>
  );
}

function FindingDemo({
  industry,
  findingId,
  territory,
  findings,
  onSelectFinding,
}: {
  industry: IndustryId;
  findingId: string;
  territory: string;
  findings: string[];
  onSelectFinding: (id: string) => void;
}) {
  const t = useTranslations("solutions.intelligence");
  const base = `categories.${industry}.findings.${findingId}`;

  return (
    <div className="rx-ii-finding">
      {findings.length > 1 && (
        <ul className="rx-ii-finding-switch" aria-label={t("findingsLabel")}>
          {findings.map((id) => (
            <li key={id}>
              <button
                type="button"
                data-on={id === findingId ? "true" : "false"}
                onClick={() => onSelectFinding(id)}
              >
                {t(`categories.${industry}.findings.${id}.switch`)}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="rx-ii-finding-top">
        <em data-terr={territory}>{territory}</em>
        <strong>{t(`${base}.money`)}</strong>
      </div>
      <p className="rx-ii-finding-summary">{t(`${base}.summary`)}</p>

      <div className="rx-ii-evidence">
        <p className="rx-ii-label">{t("evidenceLabel")}</p>
        <ul>
          {(t.raw(`${base}.evidence`) as string[]).map((row) => (
            <li key={row}>{row}</li>
          ))}
        </ul>
      </div>

      <div className="rx-ii-action">
        <p className="rx-ii-label">{t("actionLabel")}</p>
        <p>{t(`${base}.action`)}</p>
      </div>

      <p className="rx-ii-confidence">
        <span>{t("confidenceLabel")}</span>
        <strong>{t(`${base}.confidence`)}</strong>
      </p>
    </div>
  );
}

function PortfolioDemo() {
  const t = useTranslations("solutions.intelligence");
  const drivers = t.raw("categories.groups.portfolio.drivers") as {
    label: string;
    value: string;
  }[];

  return (
    <div className="rx-ii-portfolio">
      <p className="rx-ii-finding-top">
        <em data-terr="PORTFOLIO">PORTFOLIO</em>
        <strong>{t("categories.groups.portfolio.money")}</strong>
      </p>
      <p className="rx-ii-finding-summary">
        {t("categories.groups.portfolio.summary")}
      </p>

      <div className="rx-ii-decomp">
        <p className="rx-ii-label">
          {t("categories.groups.portfolio.decompLabel")}
        </p>
        <ul>
          {drivers.map((d) => (
            <li key={d.label}>
              <span>{d.label}</span>
              <strong>{d.value}</strong>
            </li>
          ))}
        </ul>
      </div>

      <p className="rx-ii-portfolio-why">
        {t("categories.groups.portfolio.why")}
      </p>

      <div className="rx-ii-action">
        <p className="rx-ii-label">{t("actionLabel")}</p>
        <p>{t("categories.groups.portfolio.action")}</p>
      </div>

      <p className="rx-ii-path">{t("categories.groups.portfolio.path")}</p>
    </div>
  );
}

function FinanceDemo() {
  const t = useTranslations("solutions.intelligence");
  const buckets = t.raw("categories.finance.month.buckets") as {
    label: string;
    value: string;
  }[];
  const stages = t.raw("categories.finance.month.stages") as {
    label: string;
    value: string;
  }[];

  return (
    <div className="rx-ii-finance">
      <p className="rx-ii-finding-top">
        <em data-terr="VALUE">VALUE</em>
        <strong>{t("categories.finance.month.money")}</strong>
      </p>
      <p className="rx-ii-finding-summary">
        {t("categories.finance.month.summary")}
      </p>

      <div className="rx-ii-decomp">
        <p className="rx-ii-label">
          {t("categories.finance.month.breakLabel")}
        </p>
        <ul>
          {buckets.map((b) => (
            <li key={b.label}>
              <span>{b.label}</span>
              <strong>{b.value}</strong>
            </li>
          ))}
        </ul>
      </div>

      <ul className="rx-ii-stages">
        {stages.map((s) => (
          <li key={s.label}>
            <em>{s.label}</em>
            <strong>{s.value}</strong>
          </li>
        ))}
      </ul>

      <div className="rx-ii-action">
        <p className="rx-ii-label">{t("actionLabel")}</p>
        <p>{t("categories.finance.month.action")}</p>
      </div>

      <p className="rx-ii-questions">
        {t("categories.finance.month.questions")}
      </p>
    </div>
  );
}
