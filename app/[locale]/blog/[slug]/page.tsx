import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import { BLOG_POSTS, getBlogPost } from "@/lib/marketing/blog";
import { TextSep } from "@/components/TextSep";
import { buildAlternatesForLocale } from "@/i18n/seo";
import {
  BLOG_HERO_IMAGE,
  FACILITY_NATIVE,
  PUBLIC_IMAGES,
} from "@/lib/marketing/publicImagery";
import "../../../home.css";
import "../../../kinetic.css";

type Props = { params: Promise<{ locale: string; slug: string }> };

type BlogSection = {
  heading?: string;
  paragraphs: string[];
};

export function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  const t = await getTranslations({ locale, namespace: "blog" });
  const title = t(`posts.${post.key}.metaTitle`);
  const description = t(`posts.${post.key}.metaDescription`);
  const path = `/blog/${slug}`;
  const hero = BLOG_HERO_IMAGE[slug];
  const ogImage = hero ? PUBLIC_IMAGES[hero.imageId].src : undefined;
  return {
    title,
    description,
    authors: [{ name: "RADR" }],
    alternates: buildAlternatesForLocale(locale, path),
    openGraph: {
      type: "article",
      title,
      description,
      url: `https://radrup.com/${locale}${path}`,
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: ["RADR"],
      tags: t.raw(`posts.${post.key}.tags`) as string[],
      ...(ogImage
        ? { images: [{ url: `https://radrup.com${ogImage}` }] }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImage ? { images: [`https://radrup.com${ogImage}`] } : {}),
    },
  };
}

function pillarFromTerritory(t: string): string {
  if (t === "RECOVER") return "Recover";
  if (t === "VALUE") return "Value";
  if (t === "BUY" || t === "LABOR" || t === "SELL") return "Operations";
  return "Decisions";
}

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const post = getBlogPost(slug);
  if (!post) notFound();

  const t = await getTranslations("blog");
  const tags = t.raw(`posts.${post.key}.tags`) as string[];
  const sections = t.raw(`posts.${post.key}.sections`) as BlogSection[];
  const title = t(`posts.${post.key}.title`);
  const description = t(`posts.${post.key}.metaDescription`);
  const related = BLOG_POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);
  const heroMap = BLOG_HERO_IMAGE[slug];
  const hero = heroMap ? PUBLIC_IMAGES[heroMap.imageId] : null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    author: {
      "@type": "Organization",
      name: "RADR",
      url: "https://radrup.com",
    },
    publisher: {
      "@type": "Organization",
      name: "RADR",
      url: "https://radrup.com",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://radrup.com/${locale}/blog/${slug}`,
    },
    keywords: tags.join(", "),
    inLanguage: locale,
    ...(hero
      ? { image: [`https://radrup.com${hero.src}`] }
      : {}),
  };

  const pull =
    sections[0]?.paragraphs[0] && sections[0].paragraphs[0].length > 80
      ? sections[0].paragraphs[0]
      : null;

  return (
    <div className="radr radr-home">
      <SiteNav />
      <main className="rx-res rx-res-pub">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <article className="rx-res-article" data-nav-theme="light">
          <div className="rx-shell rx-res-article-inner">
            <p className="rx-kicker">{pillarFromTerritory(post.territory)}</p>
            <div className="rx-res-card-meta">
              <time dateTime={post.date}>{post.date}</time>
              {post.updated && post.updated !== post.date ? (
                <>
                  <TextSep />
                  <span>{t("updatedLabel", { date: post.updated })}</span>
                </>
              ) : null}
              <TextSep />
              <span>{t("minRead", { minutes: post.readingMinutes })}</span>
              <TextSep />
              <span>{t("byline")}</span>
            </div>
            <h1 className="rx-display rx-res-article-title">{title}</h1>
            <p className="rx-res-deck">{t(`posts.${post.key}.excerpt`)}</p>
          </div>

          {hero ? (
            <figure
              className="rx-res-article-hero"
              data-panel={heroMap?.panel}
            >
              <div className="rx-res-article-hero-frame">
                <Image
                  src={hero.src}
                  alt={hero.alt}
                  width={FACILITY_NATIVE.w}
                  height={FACILITY_NATIVE.h}
                  sizes="(max-width: 900px) 92vw, 520px"
                  style={{
                    objectPosition: `${hero.focalX} ${hero.focalY}`,
                  }}
                  priority
                  quality={90}
                />
              </div>
              <figcaption>{hero.credit}</figcaption>
            </figure>
          ) : null}

          <div className="rx-shell rx-res-article-inner">
            {pull ? (
              <blockquote className="rx-res-pull">
                <p>{pull}</p>
              </blockquote>
            ) : null}

            <div className="rx-res-body">
              {sections.map((section, i) => (
                <section
                  key={section.heading ?? `s-${i}`}
                  className="rx-res-section"
                >
                  {section.heading ? <h2>{section.heading}</h2> : null}
                  {section.paragraphs.map((para, pi) =>
                    i === 0 && pi === 0 && pull ? null : (
                      <p key={para.slice(0, 56)}>{para}</p>
                    ),
                  )}
                </section>
              ))}
            </div>

            <div className="rx-res-article-cta">
              {post.territory === "RECOVER" ? (
                <div className="rx-he-ctas">
                  <Link
                    href="/contact?intent=recovery-pilot"
                    className="rx-btn rx-btn-primary"
                  >
                    {t("ctaPilot")} <span aria-hidden="true">→</span>
                  </Link>
                  <Link href="/solutions" className="rx-btn rx-btn-ghost">
                    {t("ctaRecover")}
                  </Link>
                </div>
              ) : post.territory === "VALUE" ? (
                <Link href="/product/value" className="rx-text-link">
                  See Verified Value <span aria-hidden="true">→</span>
                </Link>
              ) : post.key === "whyWeExist" ? (
                <Link href="/product" className="rx-text-link">
                  Explore the Platform <span aria-hidden="true">→</span>
                </Link>
              ) : null}
            </div>

            <Link href="/blog" className="rx-text-link">
              {t("backToBlog")}
            </Link>
          </div>
        </article>

        {related.length > 0 ? (
          <section className="rx-res-related" data-nav-theme="light">
            <div className="rx-shell">
              <h2 className="rx-res-related-title">{t("related")}</h2>
              <ul className="rx-res-grid rx-res-grid--related">
                {related.map((item) => (
                  <li key={item.slug}>
                    <Link
                      href={`/blog/${item.slug}`}
                      className="rx-res-card"
                      data-terr={item.territory}
                    >
                      <div className="rx-res-card-meta">
                        <em className="rx-res-terr">
                          {pillarFromTerritory(item.territory)}
                        </em>
                        <time dateTime={item.date}>{item.date}</time>
                      </div>
                      <h3>{t(`posts.${item.key}.title`)}</h3>
                      <p>{t(`posts.${item.key}.excerpt`)}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}
