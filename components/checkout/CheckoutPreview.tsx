"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { PublicNavbar, PublicFooter } from "@/components/marketing/PublicShell";
import { FrozenRadrLogo } from "@/components/brand/FrozenRadrLogo";
import {
  formatPublicPrice,
  standardPlanQuote,
  type BillingChoice,
} from "@/lib/marketing/publicPricing";
import { planName } from "@/lib/marketing/conversionJourney";
import {
  checkoutCompanySchema,
  COUNTRY_CODES,
  emptyCheckoutCompany,
  planCheckoutHref,
  type BasketSelection,
  type CheckoutCompany,
} from "@/lib/marketing/checkoutPreview";
import "@/app/checkout.css";

const displayNames = new Intl.DisplayNames(["en"], { type: "region" });
const countries = COUNTRY_CODES.map((code) => ({
  code,
  label: displayNames.of(code) || code,
})).sort((a, b) => a.label.localeCompare(b.label));
const steps = ["Basket", "Company", "Account", "Payment"];

function CardIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <rect x="2" y="4" width="20" height="16" rx="4" />
      <path d="M2 9h20M6 15h4" />
    </svg>
  );
}

/** Explicit, browser-only checkout rehearsal. No account, payment API or entitlement is created. */
export function CheckoutPreview({
  initialSelection,
  invalidSelection = false,
}: {
  initialSelection: BasketSelection | null;
  invalidSelection?: boolean;
}) {
  const locale = useLocale();
  const [selection, setSelection] = useState(initialSelection);
  const [company, setCompany] = useState<CheckoutCompany>({
    ...emptyCheckoutCompany,
  });
  const [touched, setTouched] = useState<
    Partial<Record<keyof CheckoutCompany, boolean>>
  >({});
  const [step, setStep] = useState(0);
  const [accountMode, setAccountMode] = useState<"create" | "login">("create");
  const [accountPreviewed, setAccountPreviewed] = useState(false);
  const [terms, setTerms] = useState(false);
  const stepTitle = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef(0);
  const companyResult = checkoutCompanySchema.safeParse(company);
  const quote = selection
    ? standardPlanQuote(selection.locations, selection.billing)
    : null;
  const alternateQuote = selection
    ? standardPlanQuote(
        selection.locations,
        selection.billing === "annual" ? "monthly" : "annual",
      )
    : null;
  const annualQuote = selection
    ? standardPlanQuote(selection.locations, "annual")
    : null;
  const pricingHref = selection?.vertical
    ? `/pricing?billing=${selection.billing}&from=demo&vertical=${selection.vertical}`
    : `/pricing?billing=${selection?.billing || "annual"}`;

  useEffect(() => {
    if (previousStep.current === step) return;
    previousStep.current = step;
    stepTitle.current?.focus({ preventScroll: true });
    stepTitle.current?.scrollIntoView({ block: "start", behavior: "instant" });
  }, [step]);

  function changeBasket(next: BasketSelection | null) {
    setSelection(next);
    setStep(0);
    setTerms(false);
    setAccountPreviewed(false);
    if (!next) {
      setCompany({ ...emptyCheckoutCompany });
      setTouched({});
    }
    const path = next
      ? planCheckoutHref(next.plan, next.billing, next.locations, next.vertical)
      : "/checkout";
    window.history.replaceState(null, "", `/${locale}${path}`);
  }
  function chooseBilling(billing: BillingChoice) {
    if (selection) changeBasket({ ...selection, billing });
  }
  function fieldError(name: keyof CheckoutCompany) {
    return !companyResult.success
      ? companyResult.error.issues.find((issue) => issue.path[0] === name)
          ?.message
      : undefined;
  }
  function field(
    name: Exclude<keyof CheckoutCompany, "authorized">,
    label: string,
    options: {
      type?: string;
      autocomplete?: string;
      placeholder?: string;
      optional?: boolean;
      maxLength?: number;
      wide?: boolean;
    } = {},
  ) {
    const error = touched[name] ? fieldError(name) : undefined;
    return (
      <div className={`ck-field${options.wide ? " ck-field-wide" : ""}`}>
        <label htmlFor={`ck-${name}`}>
          {label}
          {options.optional ? <span>Optional</span> : null}
        </label>
        <input
          id={`ck-${name}`}
          name={name}
          type={options.type || "text"}
          autoComplete={options.autocomplete}
          maxLength={options.maxLength || 200}
          placeholder={options.placeholder}
          value={company[name]}
          required={!options.optional}
          onChange={(event) => {
            setCompany((v) => ({ ...v, [name]: event.target.value }));
            setTerms(false);
            setAccountPreviewed(false);
          }}
          onBlur={() => setTouched((v) => ({ ...v, [name]: true }))}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `ck-${name}-error` : undefined}
        />
        {error ? (
          <p className="ck-error" id={`ck-${name}-error`}>
            {error}
          </p>
        ) : null}
      </div>
    );
  }
  function submitCompany(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!companyResult.success || !event.currentTarget.reportValidity()) return;
    setStep(2);
  }

  function navigateToStep(index: number) {
    // A disabled control is only a UI hint. Recheck the transition in its handler.
    if (index > step) return;
    if (index >= 2 && !checkoutCompanySchema.safeParse(company).success) {
      setStep(1);
      return;
    }
    if (index === 3 && !accountPreviewed) return;
    setStep(index);
  }

  return (
    <div className="radr ck-page">
      <PublicNavbar />
      <main className="ck-shell">
        <header className="ck-header">
          <Link href={pricingHref} className="ck-back">
            ← Back to pricing
          </Link>
          <div className="ck-header-row">
            <div>
              <p className="ck-kicker">YOUR RADR · CHECKOUT PREVIEW</p>
              <h1>
                A clear plan.
                <br />
                <em>Your next move.</em>
              </h1>
            </div>
            <p className="ck-preview-note">
              <b>Explore the purchase journey.</b> Company details stay in this
              tab’s memory. Accounts and payments are not connected; no order or
              charge is created.
            </p>
          </div>
        </header>
        {!selection || !quote ? (
          <section className="ck-empty" aria-labelledby="ck-empty-title">
            <span className="ck-empty-icon">
              <CardIcon />
            </span>
            <p className="ck-kicker">YOUR BASKET</p>
            <h2 id="ck-empty-title">
              {invalidSelection
                ? "Let’s check that selection."
                : "Your basket is empty."}
            </h2>
            <p>
              {invalidSelection
                ? "That plan, location count or billing option is not available. Choose a valid plan to continue."
                : "One subscription for your company. Choose Core for one location, or Expand for 2–5."}
            </p>
            <div className="ck-empty-actions">
              <Link
                className="ck-button ck-primary"
                href={planCheckoutHref("start")}
              >
                Add Core
              </Link>
              <Link
                className="ck-button ck-secondary"
                href={planCheckoutHref("expand")}
              >
                Add Expand
              </Link>
              <Link className="ck-inline" href="/contact?plan=enterprise">
                6+ locations? Contact sales →
              </Link>
            </div>
          </section>
        ) : (
          <>
            <nav className="ck-steps" aria-label="Checkout progress">
              {steps.map((label, index) => (
                <button
                  type="button"
                  key={label}
                  onClick={() => navigateToStep(index)}
                  disabled={index > step}
                  aria-current={index === step ? "step" : undefined}
                >
                  <span>{index < step ? "✓" : index + 1}</span>
                  {label}
                  {index === 2 && accountPreviewed ? (
                    <small>Previewed</small>
                  ) : null}
                </button>
              ))}
            </nav>
            <div className="ck-grid">
              <section
                className="ck-panel ck-main"
                aria-labelledby="ck-step-title"
              >
                <div className="ck-panel-top">
                  <span className="ck-kicker">
                    {String(step + 1).padStart(2, "0")} / 04
                  </span>
                  <span className="ck-preview-chip">Interactive preview</span>
                </div>
                <h2 id="ck-step-title" tabIndex={-1} ref={stepTitle}>
                  {
                    [
                      "Your basket.",
                      "Your company.",
                      "Your RADR account.",
                      "Review your payment.",
                    ][step]
                  }
                </h2>
                {step === 0 ? (
                  <>
                    <p className="ck-intro">
                      Choose how you pay. Both options have a 12-month
                      commitment.
                    </p>
                    <div className="ck-product">
                      <span className="ck-product-mark">
                        <FrozenRadrLogo
                          variant="mark"
                          theme="dark"
                          width={34}
                        />
                      </span>
                      <div>
                        <h3>RADR {planName(selection.plan)}</h3>
                        <p>
                          {selection.locations}{" "}
                          {selection.locations === 1 ? "location" : "locations"}{" "}
                          · one company subscription
                        </p>
                      </div>
                      <button
                        type="button"
                        className="ck-remove"
                        onClick={() => changeBasket(null)}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="ck-basket-settings">
                      <div className="ck-field">
                        <label htmlFor="ck-plan">Plan</label>
                        <select
                          id="ck-plan"
                          value={selection.plan}
                          onChange={(event) =>
                            changeBasket({
                              ...selection,
                              plan: event.target
                                .value as BasketSelection["plan"],
                              locations: event.target.value === "start" ? 1 : 2,
                            })
                          }
                        >
                          <option value="start">Core · one location</option>
                          <option value="expand">Expand · 2–5 locations</option>
                        </select>
                      </div>
                      <div className="ck-field">
                        <label htmlFor="ck-locations">Locations</label>
                        <select
                          id="ck-locations"
                          value={selection.locations}
                          disabled={selection.plan === "start"}
                          onChange={(event) =>
                            changeBasket({
                              ...selection,
                              locations: Number(event.target.value),
                            })
                          }
                        >
                          {(selection.plan === "start"
                            ? [1]
                            : [2, 3, 4, 5]
                          ).map((n) => (
                            <option key={n} value={n}>
                              {n} {n === 1 ? "location" : "locations"}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <fieldset className="ck-schedules">
                      <legend>Payment schedule</legend>
                      {(["annual", "monthly"] as const).map((billing) => {
                        const q = standardPlanQuote(
                          selection.locations,
                          billing,
                        )!;
                        return (
                          <label
                            key={billing}
                            className="ck-schedule"
                            data-selected={selection.billing === billing}
                          >
                            <input
                              type="radio"
                              name="billing"
                              value={billing}
                              checked={selection.billing === billing}
                              onChange={() => chooseBilling(billing)}
                            />
                            <span className="ck-schedule-copy">
                              <b>
                                {billing === "annual"
                                  ? "Pay yearly"
                                  : "Pay monthly"}
                                {billing === "annual" ? (
                                  <i>Lower price</i>
                                ) : null}
                              </b>
                              <strong>
                                {formatPublicPrice(
                                  billing === "annual"
                                    ? q.commitmentTotal
                                    : q.monthlyTotal,
                                )}
                                <small>
                                  /{billing === "annual" ? "year" : "month"}
                                </small>
                              </strong>
                              <span>
                                {billing === "annual"
                                  ? `${formatPublicPrice(q.monthlyTotal)}/month equivalent · paid upfront`
                                  : `${formatPublicPrice(q.commitmentTotal)} total over 12 months`}
                              </span>
                              <span>
                                {billing === "annual"
                                  ? `Save ${formatPublicPrice(q.annualSaving)} per year versus monthly instalments`
                                  : "12 monthly instalments · 12-month commitment"}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </fieldset>
                    <div className="ck-note">
                      Every plan includes evidence, Decisions and outcome
                      tracking, with self-guided setup and documentation.
                      Processing allowances and full terms must be confirmed
                      before a real purchase.
                    </div>
                    <button
                      type="button"
                      className="ck-button ck-primary ck-next"
                      onClick={() => setStep(1)}
                    >
                      Continue to company details <span>→</span>
                    </button>
                  </>
                ) : step === 1 ? (
                  <form onSubmit={submitCompany}>
                    <p className="ck-intro">
                      Use the legal business and billing details that would
                      appear on your invoice.
                    </p>
                    <p className="ck-required-note">
                      All fields are required unless marked Optional. Use the
                      details issued to your business.
                    </p>
                    <div className="ck-form-grid">
                      {field("fullName", "Your full name", {
                        autocomplete: "name",
                        maxLength: 120,
                      })}
                      {field("email", "Business email", {
                        type: "email",
                        autocomplete: "email",
                        maxLength: 254,
                      })}
                      {field("company", "Legal business name", {
                        autocomplete: "organization",
                        wide: true,
                      })}
                      {field(
                        "registrationNumber",
                        "Business registration or tax reference",
                        { maxLength: 80, wide: true },
                      )}
                      <div className="ck-field">
                        <label htmlFor="ck-country">Business country</label>
                        <select
                          id="ck-country"
                          autoComplete="country"
                          required
                          value={company.country}
                          onChange={(event) => {
                            setCompany((v) => ({
                              ...v,
                              country: event.target.value,
                            }));
                            setTerms(false);
                            setAccountPreviewed(false);
                          }}
                          onBlur={() =>
                            setTouched((v) => ({ ...v, country: true }))
                          }
                          aria-invalid={Boolean(
                            touched.country && fieldError("country"),
                          )}
                          aria-describedby={
                            touched.country && fieldError("country")
                              ? "ck-country-error"
                              : undefined
                          }
                        >
                          <option value="">Select country</option>
                          {countries.map((c) => (
                            <option key={c.code} value={c.code}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                        {touched.country && fieldError("country") ? (
                          <p id="ck-country-error" className="ck-error">
                            {fieldError("country")}
                          </p>
                        ) : null}
                      </div>
                      {field("vatId", "VAT ID", {
                        optional: true,
                        maxLength: 30,
                      })}
                      {field("address", "Billing street address", {
                        autocomplete: "street-address",
                        wide: true,
                      })}
                      {field("city", "City", {
                        autocomplete: "address-level2",
                        maxLength: 100,
                      })}
                      {field("postalCode", "Postal code", {
                        autocomplete: "postal-code",
                        maxLength: 20,
                        optional: ["AE", "HK", "MO", "QA"].includes(
                          company.country,
                        ),
                      })}
                    </div>
                    <label className="ck-check">
                      <input
                        type="checkbox"
                        checked={company.authorized}
                        onChange={(event) => {
                          setCompany((v) => ({
                            ...v,
                            authorized: event.target.checked,
                          }));
                          setTerms(false);
                          setAccountPreviewed(false);
                        }}
                        required
                      />
                      <span>I am authorized to act for this business.</span>
                    </label>
                    <p className="ck-required-status" role="status">
                      {companyResult.success
                        ? "Required details complete. Identity and business verification are still pending."
                        : "Complete every required field with valid details and confirm your authority to continue."}
                    </p>
                    <p className="ck-small">
                      These checks validate format and completeness. They do not
                      verify company registration, identity or VAT status.
                      Details are not saved or submitted in this preview.
                    </p>
                    <div className="ck-form-actions">
                      <button
                        type="button"
                        className="ck-button ck-secondary"
                        onClick={() => setStep(0)}
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        className="ck-button ck-primary"
                        disabled={!companyResult.success}
                      >
                        Continue to account <span>→</span>
                      </button>
                    </div>
                  </form>
                ) : step === 2 ? (
                  <>
                    <p className="ck-intro">
                      A real purchase will require a signed-in, verified RADR
                      account. This step previews that requirement.
                    </p>
                    <div
                      className="ck-account-switch"
                      role="group"
                      aria-label="Account option"
                    >
                      <button
                        type="button"
                        aria-pressed={accountMode === "create"}
                        onClick={() => setAccountMode("create")}
                      >
                        Create account
                      </button>
                      <button
                        type="button"
                        aria-pressed={accountMode === "login"}
                        onClick={() => setAccountMode("login")}
                      >
                        Sign in
                      </button>
                    </div>
                    <div className="ck-field">
                      <label htmlFor="ck-account-email">Account email</label>
                      <input
                        id="ck-account-email"
                        value={company.email}
                        readOnly
                        type="email"
                      />
                    </div>
                    <fieldset disabled className="ck-disabled-fields">
                      <legend>
                        {accountMode === "create"
                          ? "Create account preview"
                          : "Sign-in preview"}
                      </legend>
                      <div className="ck-field">
                        <label htmlFor="ck-password">Password</label>
                        <input
                          id="ck-password"
                          type="password"
                          autoComplete="off"
                          placeholder="Account service not connected"
                        />
                      </div>
                      {accountMode === "create" ? (
                        <div className="ck-field">
                          <label htmlFor="ck-confirm-password">
                            Confirm password
                          </label>
                          <input
                            id="ck-confirm-password"
                            type="password"
                            autoComplete="off"
                            placeholder="Account service not connected"
                          />
                        </div>
                      ) : null}
                    </fieldset>
                    <p className="ck-account-status" role="status">
                      Not signed in. Accounts and email verification are not
                      active on this preview. No password can be entered or
                      account created.
                    </p>
                    <div className="ck-form-actions">
                      <button
                        type="button"
                        className="ck-button ck-secondary"
                        onClick={() => setStep(1)}
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        className="ck-button ck-primary"
                        onClick={() => {
                          if (companyResult.success) {
                            setAccountPreviewed(true);
                            setStep(3);
                          }
                        }}
                      >
                        Preview payment step <span>→</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="ck-intro">
                      Review the company, amount and billing schedule before
                      payment.
                    </p>
                    <div className="ck-company-review">
                      <div>
                        <span className="ck-kicker">BILLING COMPANY</span>
                        <strong>{company.company}</strong>
                        <p>
                          {company.fullName} · {company.email}
                        </p>
                        <p>
                          {company.address}, {company.city} {company.postalCode}
                          ,{" "}
                          {displayNames.of(company.country) || company.country}
                        </p>
                        <p>
                          Business reference: {company.registrationNumber}
                          {company.vatId ? ` · VAT ID: ${company.vatId}` : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="ck-inline"
                        onClick={() => setStep(1)}
                      >
                        Edit details
                      </button>
                    </div>
                    <section
                      className="ck-verification"
                      aria-label="Verification status"
                    >
                      <h3>Verification is still required.</h3>
                      <p>
                        Complete fields do not prove identity or ownership. A
                        real purchase must also pass these checks.
                      </p>
                      <dl>
                        <div>
                          <dt>Email ownership</dt>
                          <dd>Not verified</dd>
                        </div>
                        <div>
                          <dt>Business and representative</dt>
                          <dd>Not verified</dd>
                        </div>
                        <div>
                          <dt>Payment authorization</dt>
                          <dd>Not connected</dd>
                        </div>
                      </dl>
                    </section>
                    <div className="ck-payment-review">
                      <CardIcon />
                      <div>
                        <strong>
                          {selection.billing === "annual"
                            ? "One annual payment"
                            : "12 monthly instalments"}
                        </strong>
                        <p>
                          {formatPublicPrice(quote.dueOnActivation)}{" "}
                          {selection.billing === "annual"
                            ? "upfront for 12 months"
                            : "per month for 12 months"}
                          , excluding VAT.
                        </p>
                        <p>
                          {formatPublicPrice(quote.commitmentTotal)} total
                          contract value, excluding VAT.
                        </p>
                      </div>
                    </div>
                    <fieldset
                      disabled
                      className="ck-disabled-fields ck-card-fields"
                    >
                      <legend>Card payment preview</legend>
                      <div className="ck-field ck-field-wide">
                        <label htmlFor="ck-card-number">Card number</label>
                        <input
                          id="ck-card-number"
                          autoComplete="off"
                          placeholder="Card payments are not connected"
                        />
                      </div>
                      <div className="ck-field">
                        <label htmlFor="ck-card-expiry">Expiry date</label>
                        <input
                          id="ck-card-expiry"
                          autoComplete="off"
                          placeholder="MM / YY"
                        />
                      </div>
                      <div className="ck-field">
                        <label htmlFor="ck-card-cvc">Security code</label>
                        <input
                          id="ck-card-cvc"
                          autoComplete="off"
                          placeholder="CVC"
                        />
                      </div>
                    </fieldset>
                    <p className="ck-account-status" role="status">
                      Payment provider not connected. Card fields are disabled
                      and no card details are collected. Previewing the account
                      step does not sign you in or allow a purchase.
                    </p>
                    <label className="ck-check">
                      <input
                        type="checkbox"
                        checked={terms}
                        onChange={(event) => setTerms(event.target.checked)}
                      />
                      <span>
                        I have reviewed this{" "}
                        {selection.billing === "annual"
                          ? "annual upfront payment"
                          : "monthly payment schedule"}{" "}
                        and the 12-month commitment.{" "}
                        <Link href="/terms">Terms</Link> and{" "}
                        <Link href="/privacy">Privacy</Link> must be finalized
                        before live purchases.
                      </span>
                    </label>
                    <button
                      type="button"
                      className="ck-button ck-primary ck-pay"
                      disabled
                    >
                      Complete purchase · not active
                    </button>
                    <p className="ck-small">
                      No order, invoice, account, payment or subscription will
                      be created.
                    </p>
                    <button
                      type="button"
                      className="ck-inline"
                      onClick={() => setStep(2)}
                    >
                      ← Back to account preview
                    </button>
                  </>
                )}
              </section>
              <aside className="ck-panel ck-summary" aria-label="Order summary">
                <p className="ck-kicker">YOUR PLAN, CLEARLY</p>
                <h2>RADR {planName(selection.plan)}</h2>
                <p className="ck-summary-locations">
                  {selection.locations}{" "}
                  {selection.locations === 1 ? "location" : "locations"} ·
                  12-month commitment
                </p>
                <dl>
                  <div>
                    <dt>
                      {selection.billing === "annual"
                        ? "Monthly equivalent"
                        : "Monthly instalment"}
                    </dt>
                    <dd>{formatPublicPrice(quote.monthlyTotal)}</dd>
                  </div>
                  {selection.locations > 1 ? (
                    <div>
                      <dt>
                        Per location / month
                        {selection.billing === "annual" ? " equivalent" : ""}
                      </dt>
                      <dd>{formatPublicPrice(quote.perLocation)}</dd>
                    </div>
                  ) : null}
                  <div>
                    <dt>Billing</dt>
                    <dd>
                      {selection.billing === "annual"
                        ? "Yearly upfront"
                        : "Monthly"}
                    </dd>
                  </div>
                  <div>
                    <dt>12-month total</dt>
                    <dd>{formatPublicPrice(quote.commitmentTotal)}</dd>
                  </div>
                  <div>
                    <dt>VAT</dt>
                    <dd>Calculated at live checkout</dd>
                  </div>
                </dl>
                <div className="ck-summary-due">
                  <span>Due on activation, excluding VAT</span>
                  <strong data-testid="checkout-due">
                    {formatPublicPrice(quote.dueOnActivation)}
                  </strong>
                  <p>
                    {selection.billing === "annual"
                      ? "One payment for the full 12-month term."
                      : "First of 12 monthly instalments."}
                  </p>
                </div>
                {selection.billing === "annual" ? (
                  <p className="ck-savings">
                    Save {formatPublicPrice(quote.annualSaving)} over 12 months
                    versus monthly instalments.
                  </p>
                ) : (
                  <div className="ck-yearly-nudge">
                    <strong>Prefer the lower annual price?</strong>
                    <p>
                      Pay {formatPublicPrice(alternateQuote!.commitmentTotal)}{" "}
                      upfront and save{" "}
                      {formatPublicPrice(annualQuote!.annualSaving)} over 12
                      months.
                    </p>
                    <button
                      type="button"
                      onClick={() => chooseBilling("annual")}
                    >
                      Switch to yearly →
                    </button>
                  </div>
                )}
                <ul className="ck-summary-benefits">
                  <li>Evidence and Decision workflow</li>
                  <li>Outcome tracking</li>
                  <li>Self-guided setup and documentation</li>
                  {selection.plan === "expand" ? (
                    <li>Location comparisons and shared context</li>
                  ) : null}
                </ul>
                <p className="ck-summary-status">
                  Preview only. Nothing is charged today.
                </p>
                <Link href={pricingHref} className="ck-summary-link">
                  Compare plans →
                </Link>
              </aside>
            </div>
          </>
        )}
      </main>
      <PublicFooter />
    </div>
  );
}
