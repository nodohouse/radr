import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import { BLOG_POSTS, getBlogPost } from "@/lib/marketing/blog";
import { TextSep } from "@/components/TextSep";
import { buildAlternatesForLocale } from "@/i18n/seo";
import "../../../home.css";

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
      authors: ["RADR"],
      tags: t.raw(`posts.${post.key}.tags`) as string[],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    author: {
      "@type": "Organization",
      name: "RADR GTM",
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
  };

  return (
    <div className="radr radr-home">
      <SiteNav />
      <main className="rx-res">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <article className="rx-res-article" data-nav-theme="light">
          <div className="rx-res-hero-glow" aria-hidden="true" />
          <div className="rx-shell rx-res-article-inner">
            <p className="rx-kicker">{t("kicker")}</p>
            <div className="rx-res-card-meta">
              {post.territory !== "ALL" ? (
                <em className="rx-res-terr">{post.territory}</em>
              ) : (
                <em className="rx-res-terr rx-res-terr--all">FIELD</em>
              )}
              <time dateTime={post.date}>{post.date}</time>
              {post.updated && post.updated !== post.date ? (
                <>
                  <TextSep />
                  <span>
                    {t("updatedLabel", { date: post.updated })}
                  </span>
                </>
              ) : null}
              <TextSep />
              <span>{t("minRead", { minutes: post.readingMinutes })}</span>
              <TextSep />
              <span>{t("byline")}</span>
            </div>
            <h1 className="rx-display rx-res-article-title">{title}</h1>
            <p className="rx-res-deck">{t(`posts.${post.key}.excerpt`)}</p>
            <ul className="rx-res-tags" aria-label="Tags">
              {tags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
            <div className="rx-res-body">
              {sections.map((section, i) => (
                <section key={section.heading ?? `s-${i}`} className="rx-res-section">
                  {section.heading ? <h2>{section.heading}</h2> : null}
                  {section.paragraphs.map((para) => (
                    <p key={para.slice(0, 56)}>{para}</p>
                  ))}
                </section>
              ))}
            </div>
            <p className="rx-res-deck" style={{ marginTop: "2rem" }}>
              {post.territory === "BUY" ? (
                <Link href="/solutions/buy" className="rx-text-link">
                  Explore BUY Intelligence →
                </Link>
              ) : post.territory === "LABOR" ? (
                <Link href="/solutions/labor" className="rx-text-link">
                  Explore LABOR Intelligence →
                </Link>
              ) : post.territory === "RECOVER" ? (
                <div className="rx-he-ctas" style={{ marginTop: "0.5rem" }}>
                  <Link
                    href="/contact?intent=recover-pilot"
                    className="rx-btn rx-btn-primary"
                  >
                    {t("ctaPilot")} →
                  </Link>
                  <Link href="/solutions/recover" className="rx-btn rx-btn-ghost">
                    {t("ctaRecover")}
                  </Link>
                </div>
              ) : post.territory === "VALUE" ? (
                <Link href="/product/value" className="rx-text-link">
                  See Verified Value →
                </Link>
              ) : post.key === "whyWeExist" ? (
                <Link href="/why" className="rx-text-link">
                  Read Why RADR →
                </Link>
              ) : null}
            </p>
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
                        {item.territory !== "ALL" ? (
                          <em className="rx-res-terr">{item.territory}</em>
                        ) : null}
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
