import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { SiteNav } from "@/components/marketing/SiteNav";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { Link } from "@/i18n/navigation";
import "./radr-explained.css";

export const metadata: Metadata = {
  title: "RADR",
  description:
    "What RADR does for restaurants, hotels and hospitality groups: connect operating evidence, compare decisions and distinguish expected value from verified outcomes.",
  alternates: {
    canonical: "https://radrup.com/en/radr-explained",
    languages: {
      en: "https://radrup.com/en/radr-explained",
      "x-default": "https://radrup.com/en/radr-explained",
    },
  },
  openGraph: {
    title: "What is RADR? Hospitality decision intelligence explained",
    description:
      "A practical guide to RADR, its operating examples, integration availability and how to evaluate it.",
    type: "website",
    url: "https://radrup.com/en/radr-explained",
    images: ["/opengraph-image"],
  },
};
const answers = [
  [
    "What is RADR?",
    "RADR is the adaptive decision system for hospitality. It is designed to connect evidence across operating systems, identify what needs attention, compare possible responses and track the result of a decision.",
  ],
  [
    "Who is RADR designed for?",
    "Restaurant operators, hotel operators and hospitality groups. The public demonstrations show restaurant service pressure and hotel operating context. Finance and operations teams can use the Value Map to examine modeled operating-value assumptions.",
  ],
  [
    "Does RADR replace a POS or PMS?",
    "No. POS and PMS systems record transactions, bookings and operating events. RADR is designed as a decision layer above these systems. Connection availability must be confirmed for each provider and engagement.",
  ],
  [
    "What is the difference between expected and verified value?",
    "Expected value is an estimate before an action or outcome. Verified value requires supporting evidence afterward, a comparable baseline and a clear attribution method. A demo amount or calculator estimate is not a customer result.",
  ],
  [
    "What can I try without an account?",
    "The public demo, platform walkthrough, research journal and Value Map are available without an account. You can prepare and save a local evaluation brief without submitting contact information.",
  ],
  [
    "Are all integrations and autonomous actions available?",
    "No. Provider availability, permissions and delivery scope need to be confirmed with the team. The public demo uses sample data and does not change external systems. Developer documentation distinguishes implemented upload paths from proposed interfaces.",
  ],
  [
    "How does pricing work?",
    "RADR describes three proposed engagement scopes: Recovery Pilot, Expand and Enterprise. Pricing is quoted after reviewing locations, the operating problem, evidence sources, responsibilities and delivery milestones. There is no published self-service subscription price.",
  ],
  [
    "How should a team evaluate RADR?",
    "Start with one measurable operating problem. Establish a baseline, identify the source evidence and assign an owner. Agree the review period and success measure before evaluating a broader rollout. Supplier credits and reconciliation can provide a focused starting point; the wider demo illustrates the product direction.",
  ],
] as const;
export default async function RadrExplained({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    inLanguage: "en",
    mainEntity: answers.map(([name, text]) => ({
      "@type": "Question",
      name,
      acceptedAnswer: { "@type": "Answer", text },
    })),
  };
  return (
    <div className="radr radr-mineral">
      <SiteNav />
      <main className="rm-explained">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(data).replace(/</g, "\\u003c"),
          }}
        />
        <header>
          <p className="rm-eyebrow">RADR explained · English guide</p>
          <h1>
            Better decisions.
            <br />
            <em>A clearer starting point.</em>
          </h1>
          <p>
            What RADR does, where it fits and how to evaluate it for your
            hospitality operation.
          </p>
          <div className="rm-explained-actions">
            <Link href="/demo" className="rx-btn rx-btn-primary">
              Explore the demo →
            </Link>
            <Link href="/contact" className="rx-btn rx-btn-ghost">
              Prepare your evaluation →
            </Link>
          </div>
        </header>
        <section aria-label="Questions about RADR">
          {answers.map(([question, answer]) => (
            <article key={question}>
              <h2>{question}</h2>
              <p>{answer}</p>
            </article>
          ))}
        </section>
        <aside aria-label="Explore RADR">
          <h2>Choose your next step.</h2>
          <div className="rm-explained-links">
            <Link href="/product">Explore the platform →</Link>
            <Link href="/value-calculator">Build a Value Map →</Link>
            <Link href="/pricing">Compare engagement scopes →</Link>
            <Link href="/product/connections">
              Check integration availability →
            </Link>
            <Link href="/security">Review trust and security →</Link>
            <Link href="/blog">Read the research journal →</Link>
          </div>
        </aside>
      </main>
      <SiteFooter />
    </div>
  );
}
