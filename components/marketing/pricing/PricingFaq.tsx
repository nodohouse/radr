"use client";

import { useState } from "react";
import { faqItems } from "./config";

export function PricingFaq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="px-faq" id="faq">
      <div className="prep-shell">
        <p className="prep-kicker">FAQ</p>
        <h2 className="px-section-title">Questions</h2>
        <div className="px-faq-list">
          {faqItems.map((item, i) => {
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
