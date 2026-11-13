import { FirstValueFunnel } from "@/components/onboarding/FirstValueFunnel";
import { publicPlan, planName } from "@/lib/marketing/conversionJourney";
import Link from "next/link";
import "../onboarding.css";
import "@/app/pricing-journey.css";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "RADR · Setup preview",
  robots: { index: false, follow: false },
};

/** Visual setup only: no account, trial, payment or subscription is created. */
export default async function OnboardingPreviewPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; vertical?: string }>;
}) {
  const search = await searchParams;
  const plan = publicPlan(search.plan);
  if (plan === "enterprise") redirect("/contact?plan=enterprise");
  const vertical =
    search.vertical === "hotel"
      ? "hotel"
      : search.vertical === "restaurant"
        ? "restaurant"
        : undefined;
  return (
    <>
      {plan ? (
        <aside className="ob-plan-preview" aria-label="Selected plan">
          <div>
            <small>SELECTED PLAN · SETUP PREVIEW</small>
            <strong>{planName(plan)}</strong>
            <p>
              Your {vertical || "hospitality"} setup preview carries this
              selection. No account, payment or paid subscription has started.
              Activation will require account services and agreed commercial
              terms.
            </p>
          </div>
          <Link
            href={`/pricing?from=demo&vertical=${vertical || "restaurant"}#plans`}
          >
            Compare plans →
          </Link>
        </aside>
      ) : null}
      <FirstValueFunnel
        key={`${plan || "preview"}-${vertical || "choose"}`}
        userName="Operator"
        workspace={null}
        preview
        previewVertical={vertical}
      />
    </>
  );
}
