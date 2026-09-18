"use client";

import { useTranslations } from "next-intl";

const MARKS = [
  { id: "t1905", value: "€184", tone: "full" as const },
  { id: "t1925", value: "€132", tone: "mid" as const },
  { id: "t1945", value: "€74", tone: "low" as const },
  { id: "t2000", value: "€0", tone: "gone" as const },
] as const;

/**
 * Some value disappears by the minute.
 */
export function SectionDeadline() {
  const t = useTranslations("homepage.deadline");

  return (
    <section
      className="rx-ed-section rx-ed-deadline"
      data-nav-theme="light"
      id="deadline"
    >
      <div className="rx-shell">
        <header className="rx-ed-head">
          <p className="rx-kicker">{t("kicker")}</p>
          <h2 className="rx-display">{t("title")}</h2>
          <p className="rx-lead">{t("lead")}</p>
        </header>

        <article className="rx-ed-decay" aria-label={t("aria")}>
          <div className="rx-ed-decay-head">
            <p className="rx-ed-decay-event">{t("event")}</p>
            <p className="rx-ed-decay-seat">{t("seating")}</p>
            <p className="rx-ed-decay-stake">
              <strong>{t("stakeAmount")}</strong>
              <span>{t("stakeLabel")}</span>
            </p>
          </div>

          <ol className="rx-ed-decay-rail">
            {MARKS.map((m) => (
              <li key={m.id} data-tone={m.tone}>
                <span className="rx-ed-decay-time">{t(`marks.${m.id}.time`)}</span>
                <span className="rx-ed-decay-bar" aria-hidden="true" />
                <strong className="rx-ed-decay-val">{m.value}</strong>
                <span className="rx-ed-decay-note">{t(`marks.${m.id}.note`)}</span>
              </li>
            ))}
          </ol>

          <p className="rx-ed-restraint">{t("close")}</p>
        </article>
      </div>
    </section>
  );
}
