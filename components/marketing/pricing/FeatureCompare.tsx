"use client";

import { Fragment, useState } from "react";
import { useTranslations } from "next-intl";
import {
  responsibilityRows,
  type CellTag,
  type ResponsibilityGroup,
} from "./config";

function Cell({ status, label }: { status: CellTag; label: string }) {
  return (
    <span className="px-cell" data-s={status === "no" ? "not" : status}>
      {label}
    </span>
  );
}

type PlanKey = "pilot" | "core" | "control";

const GROUPS: ResponsibilityGroup[] = [
  "scope",
  "intelligence",
  "proof",
  "action",
  "scale",
];

/** Buyer-first preview — 8 rows; rest behind expand. */
const PREVIEW_COUNT = 8;

type FeatureCompareProps = {
  defaultCollapsed?: boolean;
};

export function FeatureCompare({ defaultCollapsed = true }: FeatureCompareProps) {
  const t = useTranslations("pricing.compare");
  const [open, setOpen] = useState(!defaultCollapsed);
  const [mobilePlan, setMobilePlan] = useState<PlanKey>("core");
  const features = t.raw("rows") as string[];

  function statusText(s: CellTag): string {
    return t(`status.${s}`);
  }

  const visibleRows = open
    ? responsibilityRows
    : responsibilityRows.slice(0, PREVIEW_COUNT);

  return (
    <section className="px-compare" id="compare" data-nav-theme="light">
      <div className="rx30-shell">
        <header className="px-section-head">
          <p className="rx30-kicker">{t("kicker")}</p>
          <h2 className="rx30-h2 px-section-title">{t("title")}</h2>
          <button
            type="button"
            className="rx30-btn rx30-btn-ghost px-compare-toggle"
            aria-expanded={open}
            aria-controls="px-compare-body"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? t("collapse") : t("expand")}{" "}
            <span aria-hidden="true">{open ? "↑" : "↓"}</span>
          </button>
        </header>
        <div
          id="px-compare-body"
          className="px-compare-body px-compare-body--always"
          data-open="true"
        >
          <div className="px-compare-body-inner">
            <div className="px-legend">
              <span data-s="yes">{t("legend.yes")}</span>
              <span data-s="early">{t("legend.early")}</span>
              <span data-s="selected">{t("legend.selected")}</span>
              <span data-s="pilot">{t("legend.pilot")}</span>
              <span data-s="not">{t("legend.no")}</span>
            </div>

            <div className="px-table-wrap">
              <table className="px-table px-table-short">
                <thead>
                  <tr>
                    <th scope="col">{t("columns.feature")}</th>
                    <th scope="col">{t("columns.pilot")}</th>
                    <th scope="col">{t("columns.core")}</th>
                    <th scope="col">{t("columns.control")}</th>
                  </tr>
                </thead>
                <tbody>
                  {GROUPS.map((group) => {
                    const rows = visibleRows.filter((r) => r.group === group);
                    if (rows.length === 0) return null;
                    return (
                      <Fragment key={group}>
                        <tr className="px-table-group">
                          <th colSpan={4} scope="colgroup">
                            {t(`groups.${group}`)}
                          </th>
                        </tr>
                        {rows.map((row) => {
                          const fullIdx = responsibilityRows.indexOf(row);
                          const label = features[fullIdx] ?? row.feature;
                          return (
                            <tr key={`${group}-${row.feature}`}>
                              <th scope="row">{label}</th>
                              <td>
                                <Cell
                                  status={row.pilot}
                                  label={statusText(row.pilot)}
                                />
                              </td>
                              <td>
                                <Cell
                                  status={row.core}
                                  label={statusText(row.core)}
                                />
                              </td>
                              <td>
                                <Cell
                                  status={row.control}
                                  label={statusText(row.control)}
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-compare-mobile">
              <div
                className="px-roi-presets"
                role="tablist"
                aria-label={t("planAria")}
              >
                {(["pilot", "core", "control"] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    role="tab"
                    className="px-chip"
                    data-active={mobilePlan === p ? "true" : "false"}
                    onClick={() => setMobilePlan(p)}
                  >
                    {t(`columns.${p}`)}
                  </button>
                ))}
              </div>
              <ul className="px-m-list">
                {visibleRows.map((row) => {
                  const i = responsibilityRows.indexOf(row);
                  return (
                    <li key={`${row.group}-${row.feature}`}>
                      <span>
                        <em className="px-m-group">
                          {t(`groups.${row.group}`)}
                        </em>
                        {features[i] ?? row.feature}
                      </span>
                      <Cell
                        status={row[mobilePlan]}
                        label={statusText(row[mobilePlan])}
                      />
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
