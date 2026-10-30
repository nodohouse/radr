"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function PricingFaq() {
  const t = useTranslations("pricing.faq");
  const [open, setOpen] = useState<number | null>(null);
  const items = t.raw("items") as Array<{ q: string; a: string }>;

  return (
    <section className="px-faq" id="faq" data-nav-theme="light">
      <div className="rx30-shell px-faq-shell">
        <header className="px-section-head px-faq-head">
          <p className="rx30-kicker">{t("kicker")}</p>
          <h2 className="rx30-h2 px-section-title">{t("title")}</h2>
        </header>
        <div className="px-faq-list">
          {items.map((item, i) => {
            const isOpen = open === i;
            const panelId = `px-faq-a-${i}`;
            return (
              <div
                key={item.q}
                className="px-faq-item"
                data-open={isOpen ? "true" : "false"}
              >
                <button
                  type="button"
                  className="px-faq-q"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  id={`px-faq-q-${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span>{item.q}</span>
                  <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
                </button>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={`px-faq-q-${i}`}
                  className="px-faq-a-wrap"
                  data-open={isOpen ? "true" : undefined}
                >
                  <p className="px-faq-a">{item.a}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
