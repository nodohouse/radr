import { SiteFooter as PublicFooter } from "@/components/marketing/SiteFooter";
import { SiteNav as PublicNavbar } from "@/components/marketing/SiteNav";
import { HomepageSpine } from "@/components/marketing/scenes/home/HomepageSpine";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { buildAlternatesForLocale } from "@/i18n/seo";
import "../home.css";
import "../editorial.css";
import "../launch.css";
import "../decision-card.css";
import "../econ.css";
import "../motion.css";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });
  return {
    title: t("homeTitle"),
    description: t("homeDescription"),
    alternates: buildAlternatesForLocale(locale, "/"),
  };
}

/** Homepage — six scenes. Pain → Decision → Futures → Learn → Proof. */
export default async function Home({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="radr radr-home radr-editorial radr-launch">
      <PublicNavbar />
      <main>
        <HomepageSpine />
      </main>
      <PublicFooter />
    </div>
  );
}
