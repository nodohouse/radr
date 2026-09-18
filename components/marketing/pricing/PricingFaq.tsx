"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function PricingFaq() {
  const t = useTranslations("pricing.faq");
  const [open, setOpen] = useState<number | null>(null);
  const items = t.raw("items") as Array<{ q: string; a: string }>;

  return (
    <section className="px-faq" id="faq" data-nav-theme="light">
      <div className="rx-shell">
        <header className="px-section-head">
          <p className="rx-kicker">{t("kicker")}</p>
          <h2 className="px-section-title">{t("title")}</h2>
        </header>
        <div className="px-faq-list">
          {items.map((item, i) => {
            const isOpen = open === i;
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
                  onClick={() => setOpen(isOpen ? null : i)}
                >
                  <span>{item.q}</span>
                  <span aria-hidden="true">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen ? <p className="px-faq-a">{item.a}</p> : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
