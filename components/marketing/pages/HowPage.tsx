"use client";

import { useTranslations } from "next-intl";
import NextLink from "next/link";
import { Link } from "@/i18n/navigation";
import { useEffect, useState } from "react";
import { INGEST_CHANNELS, PIPELINE, STACK_SOURCES } from "../config/architecture";
import { signalByChannel } from "../data/demo";
import { useReducedMotionSafe } from "../motion/useReducedMotionSafe";
import { useScrollStage } from "../motion/useScrollStage";
import { SiteFooter } from "../SiteFooter";
import { SiteNav } from "../SiteNav";
import { RadrWordmark } from "../RadrWordmark";
import { TextSep } from "@/components/TextSep";

const STAGE_IDS = [
  { id: "connect", n: "01" },
  { id: "understand", n: "02" },
  { id: "detect", n: "03" },
  { id: "explain", n: "04" },
  { id: "act", n: "05" },
  { id: "control", n: "06" },
  { id: "verify", n: "07" },
  { id: "learn", n: "08" },
] as const;

const FLYWHEEL_KEYS = ["1", "2", "3", "4", "5"] as const;

const STACK = [
  "PMS",
  "POS",
  "Procurement",
  "Workforce",
  "Accounting",
  "Payments",
  "Delivery",
  "Revenue",
] as const;

type Buy = ReturnType<typeof signalByChannel>;

function StageVisual({ stage, buy }: { stage: number; buy: Buy }) {
  const t = useTranslations("how");
  const tv = useTranslations("how.stageVisual");
  const workflow = t.raw("workflow") as string[];
  const learnItems = tv.raw("learn.items") as string[];
  const actEvidence = tv.raw("act.evidence") as string[];
  const understandFields = [
    ["supplier", "FreshCo"],
    ["location", "New York Flatiron"],
    ["item", "Avocado Hass 18ct"],
    ["contract", "€31.20 / case"],
    ["invoice", "€34.80 / case"],
    ["channel", "Procurement"],
  ] as const;

  // STAGES: 0 connect, 1 understand, 2 detect, 3 explain, 4 act, 5 control, 6 verify, 7 learn
  return (
    <div className="rx-howp-visual" data-stage={stage}>
      <div className="rx-howp-scan" aria-hidden="true" />

      {stage === 0 ? (
        <article className="rx-howp-card">
          <header>
            <span>{tv("connect.header")}</span>
            <span>{tv("connect.badge")}</span>
          </header>
          <h3>{tv("connect.title")}</h3>
          <ul className="rx-howp-evidence">
            {INGEST_CHANNELS.slice(0, 5).map((s) => (
              <li key={s.id}>
                {s.title}
                <TextSep />
                {s.status}
              </li>
            ))}
          </ul>
          <p className="rx-howp-item">{tv("connect.statusNote")}</p>
        </article>
      ) : null}

      {stage === 1 ? (
        <article className="rx-howp-card">
          <header>
            <span>{tv("understand.header")}</span>
            <span>{tv("understand.badge")}</span>
          </header>
          <h3>{tv("understand.title")}</h3>
          <dl className="rx-howp-facts">
            {understandFields.map(([key, v]) => (
              <div key={key}>
                <dt>{tv(`understand.fields.${key}`)}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </article>
      ) : null}

      {stage === 2 ? (
        <article className="rx-howp-card">
          <header>
            <span>{tv("detect.header")}</span>
            <span className="rx-howp-prio">{tv("detect.priority")}</span>
          </header>
          <h3>{buy.title}</h3>
          <p className="rx-howp-item">{buy.source.detail}</p>
          <div className="rx-howp-rows">
            <div>
              <em>{tv("detect.contractPrice")}</em>
              <TextSep srOnly>: </TextSep>
              <strong className="rx-money">{buy.source.should.value}</strong>
            </div>
            <div data-flag="true">
              <em>{tv("detect.invoicePrice")}</em>
              <TextSep srOnly>: </TextSep>
              <strong className="rx-money">{buy.source.actual.value}</strong>
            </div>
          </div>
          <p className="rx-howp-ping">
            <span className="rx-tri">△</span> {buy.source.unitDelta}
          </p>
          <p className="rx-howp-impact">
            <span className="rx-tri">△</span> {buy.amount}
            {buy.period}
          </p>
        </article>
      ) : null}

      {stage === 3 ? (
        <article className="rx-howp-card">
          <header>
            <span>{tv("explain.header")}</span>
            <span>{tv("explain.badge")}</span>
          </header>
          <h3>{buy.title}</h3>
          <dl className="rx-howp-facts">
            <div>
              <dt>{tv("explain.supplier")}</dt>
              <dd>FreshCo</dd>
            </div>
            <div>
              <dt>{tv("explain.item")}</dt>
              <dd>{buy.source.detail}</dd>
            </div>
            <div>
              <dt>{tv("explain.contract")}</dt>
              <dd className="rx-money">{buy.source.should.value}</dd>
            </div>
            <div>
              <dt>{tv("explain.invoice")}</dt>
              <dd className="rx-money">{buy.source.actual.value}</dd>
            </div>
            <div>
              <dt>{tv("explain.volume")}</dt>
              <dd>{tv("explain.volumeValue")}</dd>
            </div>
          </dl>
          <div className="rx-howp-impact-block">
            <em>{tv("explain.annualImpact")}</em>
            <TextSep srOnly>: </TextSep>
            <strong className="rx-money">{buy.amount}</strong>
          </div>
        </article>
      ) : null}

      {stage === 4 ? (
        <article className="rx-howp-card">
          <header>
            <span>{tv("act.header")}</span>
            <span>{tv("act.badge")}</span>
          </header>
          <p className="rx-howp-meta-label">{tv("act.recommended")}</p>
          <h3>{tv("act.title")}</h3>
          <p className="rx-howp-meta-label">{tv("act.evidenceReady")}</p>
          <ul className="rx-howp-evidence">
            {actEvidence.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <div className="rx-howp-workflow" aria-label={tv("act.workflowAria")}>
            {workflow.map((w, i) => (
              <span key={w} data-on={i <= 1 ? "true" : "false"}>
                {w}
              </span>
            ))}
          </div>
          <p className="rx-howp-assign">{tv("act.assigned")}</p>
          <p className="rx-howp-action">{buy.action}</p>
        </article>
      ) : null}

      {stage === 5 ? (
        <article className="rx-howp-card">
          <header>
            <span>{tv("control.header")}</span>
            <span>{tv("control.badge")}</span>
          </header>
          <p className="rx-howp-meta-label">{tv("control.resolution")}</p>
          <h3>{tv("control.title")}</h3>
          <p className="rx-howp-item">{tv("control.body")}</p>
          <div className="rx-howp-control">
            <em>{tv("control.created")}</em>
            <strong>
              {tv("control.ruleLine1")}
              <br />
              {tv("control.ruleLine2")}
              <br />
              {tv("control.ruleLine3")}
            </strong>
            <p>{tv("control.next")}</p>
          </div>
        </article>
      ) : null}

      {stage === 6 ? (
        <article className="rx-howp-card rx-howp-card--verify">
          <div className="rx-howp-verify-flow">
            <div className="rx-howp-verify-step" data-step="expected">
              <em>{tv("verify.expected")}</em>
              <TextSep srOnly>: </TextSep>
              <strong className="rx-money">{buy.amount}</strong>
            </div>
            <div className="rx-howp-verify-line" aria-hidden="true" />
            <div className="rx-howp-verify-step" data-step="received">
              <em>{tv("verify.received")}</em>
              <TextSep srOnly>: </TextSep>
              <strong className="rx-money">{buy.amount}</strong>
            </div>
            <p className="rx-howp-verified">{tv("verify.verified")}</p>
            <div className="rx-howp-impact-block">
              <strong className="rx-money">{buy.amount}</strong>
              <TextSep srOnly>: </TextSep>
              <em>{tv("verify.added")}</em>
            </div>
          </div>
        </article>
      ) : null}

      {stage === 7 ? (
        <article className="rx-howp-card">
          <header>
            <span>{tv("learn.header")}</span>
            <span>{tv("learn.badge")}</span>
          </header>
          <h3>{tv("learn.title")}</h3>
          <ul className="rx-howp-evidence">
            {learnItems.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
          <p className="rx-howp-item">{t("learnNote")}</p>
        </article>
      ) : null}
    </div>
  );
}

/**
 * How RADR works: one BUY signal through Detect→Verify.
 * Sticky progressive story on desktop; stacked on mobile.
 */
export function HowPage() {
  const t = useTranslations("how");
  const buy = signalByChannel("buy");
  const reduced = useReducedMotionSafe();
  const [mobile, setMobile] = useState(false);
  const stages = STAGE_IDS.map((s) => ({
    ...s,
    label: t(`stages.${s.id}.label`),
    title: t(`stages.${s.id}.title`),
    copy: t(`stages.${s.id}.copy`),
  }));
  const flywheel = FLYWHEEL_KEYS.map((k) => ({
    t: t(`flywheel.${k}.t`),
    d: t(`flywheel.${k}.d`),
  }));
  const loopLines = t.raw("loopLines") as string[];
  const closerLines = t.raw("closerLines") as string[];
  const notItems = t.raw("notItems") as string[];

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const u = () => setMobile(mq.matches);
    u();
    mq.addEventListener("change", u);
    return () => mq.removeEventListener("change", u);
  }, []);

  const sticky = !reduced;
  const { rootRef, index, setIndex } = useScrollStage(stages.length, sticky);
  const stage = stages[index]!;

  return (
    <div className="radr radr-mineral">
      <SiteNav />
      <main>
        <section className="rx-page-hero rx-how-hero rx-page-hero--mineral" data-nav-theme="light">
          <div className="rx-shell rx-how-hero-inner">
            <p className="rx-kicker">{t("kicker")}</p>
            <h1 className="rx-page-title">
              {t("heroTitleLine1")}
              <br />
              {t("heroTitleLine2")}
            </h1>
            <p className="rx-lead rx-lead-short">{t("heroLead")}</p>
            <div className="rx-page-signal">
              <span>
                {t("signalPrefix")}
                <TextSep />
                {buy.title}
              </span>
              <strong className="rx-money">
                <span className="rx-tri">△</span> {buy.amount}
                {buy.period}
              </strong>
            </div>
          </div>
        </section>

        <section className="rx-howp-archstrip" data-nav-theme="light">
          <div className="rx-shell">
            <p className="rx-kicker">{t("archKicker")}</p>
            <h2 className="rx-display rx-display-xs">{t("archTitle")}</h2>
            <ul className="rx-howp-archstrip-stack">
              {STACK_SOURCES.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <ol className="rx-howp-archstrip-pipe">
              {PIPELINE.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ol>
            <p className="rx-lead rx-lead-short">{t("archLead")}</p>
          </div>
        </section>

        {reduced ? (
          <section className="rx-howp-mobile" data-nav-theme="light">
            <div className="rx-shell">
              {stages.map((s, i) => (
                <article
                  key={s.id}
                  id={s.id}
                  className="rx-howp-mobile-card"
                >
                  <p className="rx-howp-stage-kicker">
                    {s.n} / {s.label.toUpperCase()}
                  </p>
                  <h2 className="rx-howp-stage-title">{s.title}</h2>
                  <p className="rx-howp-copy">{s.copy}</p>
                  <StageVisual stage={i} buy={buy} />
                </article>
              ))}
            </div>
          </section>
        ) : (
          <section
            className={`rx-howp-story${mobile ? " rx-howp-story--mobile" : ""}`}
            ref={rootRef}
            data-nav-theme="light"
            style={{ height: `${stages.length * (mobile ? 85 : 75)}vh` }}
          >
            <div className="rx-howp-pin">
              {mobile ? (
                <div className="rx-shell rx-howp-mobile-stage">
                  <p className="rx-howp-mobile-prog">
                    {stage.n} / 0{stages.length}
                  </p>
                  <p className="rx-howp-stage-kicker">
                    {stage.n} / {stage.label.toUpperCase()}
                  </p>
                  <h2 className="rx-howp-stage-title">{stage.title}</h2>
                  <p className="rx-howp-copy">{stage.copy}</p>
                  <StageVisual key={index} stage={index} buy={buy} />
                </div>
              ) : (
                <div className="rx-shell rx-howp-grid">
                  <aside className="rx-howp-rail" aria-label="RADR loop progress">
                    <div className="rx-howp-rail-track" aria-hidden="true">
                      <i
                        style={{
                          height: `${((index + 0.5) / stages.length) * 100}%`,
                        }}
                      />
                    </div>
                    <ul>
                      {stages.map((s, i) => (
                        <li
                          key={s.id}
                          id={s.id}
                          data-on={i === index ? "true" : "false"}
                        >
                          <button type="button" onClick={() => setIndex(i)}>
                            <span>{s.n}</span>
                            {s.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </aside>

                  <div className="rx-howp-copycol">
                    <p className="rx-howp-stage-kicker">
                      {stage.n} / {stage.label.toUpperCase()}
                    </p>
                    <h2 className="rx-howp-stage-title">{stage.title}</h2>
                    <p className="rx-howp-copy">{stage.copy}</p>
                  </div>

                  <StageVisual key={index} stage={index} buy={buy} />
                </div>
              )}
            </div>
          </section>
        )}

        <section className="rx-howp-loop" data-nav-theme="light">
          <div className="rx-shell rx-howp-loop-inner">
            <p className="rx-kicker">{t("loopKicker")}</p>
            <h2 className="rx-howp-loop-title">
              {loopLines.map((line, i) => (
                <span key={line}>
                  {i > 0 ? <br /> : null}
                  {line}
                </span>
              ))}
            </h2>
            <ol className="rx-howp-flow">
              {stages.map((s) => (
                <li key={s.id}>
                  <strong>{s.label}</strong>
                  <span>{s.title}</span>
                </li>
              ))}
            </ol>
            <p className="rx-howp-closer">
              {closerLines.map((line, i) => (
                <span key={line}>
                  {i > 0 ? <br /> : null}
                  {line}
                </span>
              ))}
            </p>
          </div>
        </section>

        <section className="rx-howp-depth" data-nav-theme="light">
          <div className="rx-shell rx-howp-depth-grid">
            <div>
              <p className="rx-kicker">{t("flywheelKicker")}</p>
              <h2 className="rx-display rx-display-sm">
                {t("flywheelTitleLine1")}
                <br />
                {t("flywheelTitleLine2")}
              </h2>
              <p className="rx-lead rx-lead-short">{t("flywheelLead")}</p>
            </div>
            <ol className="rx-howp-flywheel">
              {flywheel.map((f, i) => (
                <li key={f.t}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{f.t}</strong>
                    <em>{f.d}</em>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="rx-howp-arch" data-nav-theme="light">
          <div className="rx-shell">
            <p className="rx-kicker">{t("archKicker")}</p>
            <h2 className="rx-display rx-display-sm">
              {t("archBoardTitleLine1")}
              <br />
              {t("archBoardTitleLine2")}
            </h2>
            <div className="rx-howp-arch-board">
              <ul className="rx-howp-arch-stack">
                {STACK.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
              <div className="rx-howp-arch-hub">
                <RadrWordmark size="md" variant="luminous" />
                <p>{t("archBoardLoop")}</p>
                <strong>Verified Value</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="rx-howp-compare" data-nav-theme="light">
          <div className="rx-shell rx-howp-compare-grid">
            <div>
              <p className="rx-kicker">{t("categoryKicker")}</p>
              <h2 className="rx-display rx-display-sm">
                {t("categoryTitleLine1")}
                <br />
                {t("categoryTitleLine2")}
              </h2>
            </div>
            <ul className="rx-howp-compare-list">
              <li>
                <em>{t("compare.bi.label")}</em>
                <span>{t("compare.bi.desc")}</span>
              </li>
              <li>
                <em>{t("compare.alerts.label")}</em>
                <span>{t("compare.alerts.desc")}</span>
              </li>
              <li>
                <em>{t("compare.consultants.label")}</em>
                <span>{t("compare.consultants.desc")}</span>
              </li>
              <li data-win="true">
                <em>{t("compare.radr.label")}</em>
                <span>{t("compare.radr.desc")}</span>
              </li>
            </ul>
          </div>
        </section>

        <section className="rx-howp-not" data-nav-theme="light">
          <div className="rx-shell rx-howp-not-inner">
            <p className="rx-kicker">{t("clarityKicker")}</p>
            <h2 className="rx-display rx-display-sm">{t("notTitle")}</h2>
            <ul>
              {notItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="rx-howp-not-close">{t("notClose")}</p>
            <div className="rx-ctas">
              <NextLink href="/demo" className="rx-btn rx-btn-primary">
                {t("ctaSecondary")} <span aria-hidden="true">→</span>
              </NextLink>
              <Link href="/contact" className="rx-btn rx-btn-ghost">
                {t("ctaBook")}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
