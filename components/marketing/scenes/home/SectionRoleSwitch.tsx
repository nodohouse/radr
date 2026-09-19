"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

const ROLES = ["gm", "cfo", "chef", "host"] as const;
type RoleId = (typeof ROLES)[number];

/**
 * One operation. Different decisions — role tabs for terrace closes.
 */
export function SectionRoleSwitch() {
  const t = useTranslations("homepage.roleSwitch");
  const [role, setRole] = useState<RoleId>("gm");

  return (
    <section
      className="rx-ed-section rx-ed-roles"
      data-nav-theme="light"
      id="roles"
    >
      <div className="rx-shell">
        <header className="rx-ed-head rx-ed-head-wide">
          <p className="rx-kicker">{t("kicker")}</p>
          <h2 className="rx-display rx-display-lg">
            <span className="rx-ed-roles-line">{t("titleLine1")}</span>
            <span className="rx-ed-roles-line">{t("titleLine2")}</span>
          </h2>
          <p className="rx-lead">{t("lead")}</p>
        </header>

        <p className="rx-ed-roles-event">{t("event")}</p>

        <div className="rx-ed-roles-board">
          <div className="rx-ed-roles-tabs" role="tablist" aria-label={t("tabsAria")}>
            {ROLES.map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                id={`rx-role-tab-${id}`}
                aria-selected={role === id}
                aria-controls={`rx-role-panel-${id}`}
                data-active={role === id ? "true" : "false"}
                className="rx-ed-roles-tab"
                onClick={() => setRole(id)}
              >
                {t(`roles.${id}.tab`)}
              </button>
            ))}
          </div>

          {ROLES.map((id) => (
            <div
              key={id}
              role="tabpanel"
              id={`rx-role-panel-${id}`}
              aria-labelledby={`rx-role-tab-${id}`}
              hidden={role !== id}
              className="rx-ed-roles-panel"
            >
              <p className="rx-ed-roles-vert">{t(`roles.${id}.label`)}</p>
              <h3>{t(`roles.${id}.insight`)}</h3>
              <p>{t(`roles.${id}.action`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
