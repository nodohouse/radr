import type { Metadata } from "next";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { SiteNav } from "@/components/marketing/SiteNav";
import { BLOG_POSTS, type BlogPostMeta } from "@/lib/marketing/blog";
import { TextSep } from "@/components/TextSep";
import { buildAlternatesForLocale } from "@/i18n/seo";
import {
  BLOG_HERO_BY_SLUG,
  marketingImage,
} from "@/lib/marketing/publicImagery";
import "../../home.css";
import "../../kinetic.css";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });
  const title = t("metaTitle");
  const description = t("metaDescription");
  return {
    title,
    description,
    alternates: buildAlternatesForLocale(locale, "/blog"),
    openGraph: {
      type: "website",
      title,
      description,
      url: `https://radrup.com/${locale}/blog`,
    },
  };
}

type SectionId = "recover" | "decisions" | "value" | "operations" | "field";

function sectionFor(post: BlogPostMeta): SectionId {
  if (post.territory === "RECOVER") return "recover";
  if (post.territory === "VALUE") return "value";
  if (post.territory === "BUY" || post.territory === "LABOR" || post.territory === "SELL")
    return "operations";
  if (post.key === "whyWeExist" || post.key === "marginIntelligence") return "decisions";
  return "field";
}

const SECTION_LABEL: Record<SectionId, string> = {
  recover: "Recover",
  decisions: "Decisions",
  value: "Value",
  operations: "Operations",
  field: "Field notes",
};

function pillarLabel(post: BlogPostMeta): string {
  return SECTION_LABEL[sectionFor(post)];
}

function PostMedia({ slug, featured = false }: { slug: string; featured?: boolean }) {
  const id = BLOG_HERO_BY_SLUG[slug];
  if (!id) return null;
  const img = marketingImage(id);
  const max = featured ? Math.min(img.cssMax, 520) : Math.min(img.cssMax, 360);
  return (
    <figure className="rx-res-card-media">
      <Image
        src={img.src}
        alt={img.alt}
        width={img.nativeWidth}
        height={img.nativeHeight}
        sizes={`(max-width: 700px) 92vw, ${max}px`}
        style={{ objectPosition: `${img.focalX} ${img.focalY}` }}
        loading={featured ? "eager" : "lazy"}
        quality={88}
      />
    </figure>
  );
}

function PostCard({
  post,
  title,
  excerpt,
  readLabel,
  minRead,
  featured = false,
}: {
  post: BlogPostMeta;
  title: string;
  excerpt: string;
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
      <PostMedia slug={post.slug} featured={featured} />
      <div className="rx-res-card-copy">
        <div className="rx-res-card-meta">
          <em className="rx-res-terr">{pillarLabel(post)}</em>
          <time dateTime={post.date}>{post.date}</time>
          <TextSep />
          <span>{minRead}</span>
        </div>
        <h2>{title}</h2>
        <p>{excerpt}</p>
        <span className="rx-res-read">
          {readLabel} <span aria-hidden="true">→</span>
        </span>
      </div>
    </Link>
  );
}

export default async function BlogIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("blog");
  const featured =
    BLOG_POSTS.find((p) => p.featured) ?? BLOG_POSTS[0];
  const rest = BLOG_POSTS.filter((p) => p.slug !== featured?.slug);

  const sections: SectionId[] = [
    "recover",
    "decisions",
    "value",
    "operations",
    "field",
  ];

  return (
    <div className="radr radr-home">
      <SiteNav />
      <main className="rx-res rx-res-pub">
        <section className="rx-res-hero" data-nav-theme="light">
          <div className="rx-shell">
            <p className="rx-kicker">{t("kicker")}</p>
            <h1 className="rx-display rx-res-title">{t("title")}</h1>
            <p className="rx-lead rx-res-lead">{t("lead")}</p>
          </div>
        </section>

        <section className="rx-res-list" data-nav-theme="light">
          <div className="rx-shell-wide rx-res-pub-frame">
            {featured ? (
              <PostCard
                post={featured}
                featured
                title={t(`posts.${featured.key}.title`)}
                excerpt={t(`posts.${featured.key}.excerpt`)}
                readLabel={t("read")}
                minRead={t("minRead", { minutes: featured.readingMinutes })}
              />
            ) : null}

            {sections.map((sec) => {
              const posts = rest.filter((p) => sectionFor(p) === sec);
              if (posts.length === 0) return null;
              return (
                <div key={sec} className="rx-res-section">
                  <h2 className="rx-res-section-title">{SECTION_LABEL[sec]}</h2>
                  <ul className="rx-res-grid rx-res-grid-editorial">
                    {posts.map((post) => (
                      <li key={post.slug}>
                        <PostCard
                          post={post}
                          title={t(`posts.${post.key}.title`)}
                          excerpt={t(`posts.${post.key}.excerpt`)}
                          readLabel={t("read")}
                          minRead={t("minRead", {
                            minutes: post.readingMinutes,
                          })}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}

            <div className="rx-res-cta-band">
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
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
