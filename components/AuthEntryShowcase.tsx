"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { FrozenRadrLogo } from "@/components/brand/FrozenRadrLogo";
import { useReducedMotionSafe } from "@/components/marketing/motion/useReducedMotionSafe";

/** Three fictional signals, one composed stage. Motion never moves the form. */
export function AuthEntryShowcase() {
  const t = useTranslations("auth.showcase");
  const reduced = useReducedMotionSafe();
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const timer = window.setInterval(() => setActive((n) => (n + 1) % 3), 4200);
    return () => window.clearInterval(timer);
  }, [reduced]);
  return (
    <div className="ob-capture-stage" aria-hidden="true">
      <div className="ob-capture-top">
        <span>
          <i />
          {t("label")}
        </span>
        <small>{t("fictional")}</small>
      </div>
      <div className="ob-capture-radar">
        <div className="ob-capture-ring" />
        <div className="ob-capture-sweep" />
        <FrozenRadrLogo variant="mark" theme="dark" width={47} decorative />
        <i className="ob-capture-dot is-one" />
        <i className="ob-capture-dot is-two" />
        <i className="ob-capture-dot is-three" />
      </div>
      <div className="ob-capture-stream">
        {[0, 1, 2].map((i) => (
          <div key={i} data-active={i === active}>
            <span>0{i + 1}</span>
            <strong>{t(`signals.${i}.source`)}</strong>
            <i />
          </div>
        ))}
      </div>
      <div className="ob-capture-decision" data-scene={active}>
        {[0, 1, 2].map((i) => (
          <article
            className="ob-capture-scene"
            key={i}
            data-active={i === active}
          >
            <p className="ob-capture-status">
              <span />
              {t(`signals.${i}.status`)}
            </p>
            <h3>{t(`signals.${i}.title`)}</h3>
            <p>{t(`signals.${i}.detail`)}</p>
            <div className="ob-capture-next">
              <span>{t("next")}</span>
              <strong>{t(`signals.${i}.next`)}</strong>
              <b>
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M6 18 18 6M6 6h12v12" />
                </svg>
              </b>
            </div>
          </article>
        ))}
      </div>
      <div className="ob-capture-bottom">
        <svg viewBox="0 0 300 54" fill="none">
          <path d="M0 44H300M0 24H300M0 4H300" stroke="#ffffff15" />
          <path
            className="ob-capture-line"
            d="M2 46L28 40 48 43 70 29 95 33 120 22 143 29 166 15 191 20 215 8 241 15 265 5 296 1"
            stroke="#00ed94"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </svg>
        <span>{t("bottom")}</span>
        <div className="ob-capture-progress">
          {[0, 1, 2].map((i) => (
            <i key={i} data-active={active === i} />
          ))}
        </div>
      </div>
    </div>
  );
}
