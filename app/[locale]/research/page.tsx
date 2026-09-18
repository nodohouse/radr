import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import NextLink from "next/link";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import {
  RESEARCH_FACTS,
  type ResearchFact,
} from "@/data/research/researchFacts";
import { buildAlternatesForLocale } from "@/i18n/seo";
import "@/app/kinetic.css";
import "@/app/product-chapters.css";

type Props = { params: Promise<{ locale: string }> };

const CATEGORIES: { id: ResearchFact["category"]; label: string }[] = [
  { id: "restaurants", label: "Restaurants" },
  { id: "hotels", label: "Hotels" },
  { id: "european_hospitality", label: "European hospitality" },
  { id: "finance_ap", label: "Finance / AP" },
  { id: "food_waste", label: "Food / waste" },
];

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: "Research & sources — RADR",
    description:
      "Sourced industry evidence behind RADR’s thesis. Evidence before claim.",
    alternates: buildAlternatesForLocale(locale, "/research"),
    robots: { index: true, follow: true },
  };
}

export default async function ResearchPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const facts = Object.values(RESEARCH_FACTS);

  return (
    <div className="radr radr-mineral rx-ch rx-ch-light">
      <SiteNav />
      <main>
        <section className="rx-rec-sec" data-nav-theme="light" style={{ paddingTop: "5rem" }}>
          <div className="rx-shell">
            <p className="rx-rec-k">Evidence library</p>
            <h1 className="rx-rec-h">Research &amp; sources</h1>
            <p className="rx-rec-p">
              Every public statistic on RADR resolves here. If a source does not
              support the claim, we do not write the claim.
            </p>

            {CATEGORIES.map((cat) => {
              const items = facts.filter((f) => f.category === cat.id);
              if (!items.length) return null;
              return (
                <section key={cat.id} className="rx-research-cat" id={cat.id}>
                  <h2>{cat.label}</h2>
                  <ul className="rx-research-lib-list">
                    {items.map((f) => (
                      <li key={f.id}>
                        <strong>{f.metric}</strong>
                        <p>
                          {f.statement}
                        </p>
                        <span>
                          {f.population} · {f.geography} · {f.publicationDate}
                        </span>
                        <em>
                          {f.publisher} · {f.report}
                        </em>
                        <a
                          href={f.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View source ↗
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}

            <p style={{ marginTop: "2rem" }}>
              <NextLink href="/" className="rx-btn rx-btn-ghost">
                Back home <span aria-hidden="true">→</span>
              </NextLink>
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
