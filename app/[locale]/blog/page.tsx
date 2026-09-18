import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import { BLOG_POSTS, type BlogPostMeta } from "@/lib/marketing/blog";
import { TextSep } from "@/components/TextSep";
import { buildAlternatesForLocale } from "@/i18n/seo";
import "../../home.css";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  const title = t("metaTitle");
  const description = t("metaDescription");
  return {
    title,
    description,
    keywords: [
      "unapplied vendor credits restaurants",
      "supplier credit memo multi-unit",
      "recover money on your stack",
      "restaurant AP credit recovery",
      "RADR",
    ],
    alternates: buildAlternatesForLocale(locale, "/blog"),
    openGraph: {
      type: "website",
      title,
      description,
      url: `https://radrup.com/${locale}/blog`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function PostCard({
  post,
  title,
  excerpt,
  tags,
  readLabel,
  minRead,
  featured = false,
}: {
  post: BlogPostMeta;
  title: string;
  excerpt: string;
  tags: string[];
  readLabel: string;
  minRead: string;
  featured?: boolean;
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={featured ? "rx-res-card rx-res-card--feature" : "rx-res-card"}
      data-terr={post.territory}
    >
      <div className="rx-res-card-meta">
        {post.territory !== "ALL" ? (
          <em className="rx-res-terr">{post.territory}</em>
        ) : (
          <em className="rx-res-terr rx-res-terr--all">FIELD</em>
        )}
        <time dateTime={post.date}>{post.date}</time>
        <TextSep />
        <span>{minRead}</span>
      </div>
      <h2>{title}</h2>
      <p>{excerpt}</p>
      <ul className="rx-res-tags" aria-label="Tags">
        {tags.map((tag) => (
          <li key={tag}>{tag}</li>
        ))}
      </ul>
      <span className="rx-res-read">
        {readLabel} <span aria-hidden="true">→</span>
      </span>
    </Link>
  );
}

export default async function BlogIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("blog");
  const [featured, ...rest] = BLOG_POSTS;

  return (
    <div className="radr radr-home">
      <SiteNav />
      <main className="rx-res">
        <section className="rx-res-hero" data-nav-theme="light">
          <div className="rx-res-hero-glow" aria-hidden="true" />
          <div className="rx-shell">
            <p className="rx-kicker">{t("kicker")}</p>
            <h1 className="rx-display rx-res-title">{t("title")}</h1>
            <p className="rx-lead rx-res-lead">{t("lead")}</p>
          </div>
        </section>

        <section className="rx-res-list" data-nav-theme="light">
          <div className="rx-shell">
            {featured ? (
              <PostCard
                post={featured}
                featured
                title={t(`posts.${featured.key}.title`)}
                excerpt={t(`posts.${featured.key}.excerpt`)}
                tags={t.raw(`posts.${featured.key}.tags`) as string[]}
                readLabel={t("read")}
                minRead={t("minRead", { minutes: featured.readingMinutes })}
              />
            ) : null}

            <ul className="rx-res-grid">
              {rest.map((post) => {
                const tags = t.raw(`posts.${post.key}.tags`) as string[];
                return (
                  <li key={post.slug}>
                    <PostCard
                      post={post}
                      title={t(`posts.${post.key}.title`)}
                      excerpt={t(`posts.${post.key}.excerpt`)}
                      tags={tags}
                      readLabel={t("read")}
                      minRead={t("minRead", { minutes: post.readingMinutes })}
                    />
                  </li>
                );
              })}
            </ul>

            <div className="rx-res-cta-band">
              <Link href="/contact?intent=recover-pilot" className="rx-btn rx-btn-primary">
                {t("ctaPilot")} <span aria-hidden="true">→</span>
              </Link>
              <Link href="/solutions/recover" className="rx-btn rx-btn-ghost">
                {t("ctaRecover")}
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
