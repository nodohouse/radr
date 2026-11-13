"use client";
import { useId, useState } from "react";
import { Link } from "@/i18n/navigation";
import { planForLocations, planName } from "@/lib/marketing/conversionJourney";
import {
  standardPlanQuote,
  formatPublicPrice,
} from "@/lib/marketing/publicPricing";
import "@/app/buyer-guide.css";
export function PricingFitGuide() {
  const id = useId();
  const [text, setText] = useState("");
  const count = /^\d{1,5}$/.test(text) ? Number(text) : NaN;
  const valid = Number.isSafeInteger(count) && count >= 1;
  const plan = valid ? planForLocations(count) : null;
  const quote = valid ? standardPlanQuote(count) : null;
  return (
    <section className="br-plan-fit" aria-labelledby={`${id}-title`}>
      <div>
        <p className="rx30-kicker">Choose by operating footprint</p>
        <h3 id={`${id}-title`}>Which package fits your locations?</h3>
        <p>
          Count each restaurant, hotel or operating venue once. A hotel’s rooms
          belong to that hotel, rather than counting as separate locations.
        </p>
      </div>
      <div>
        <label htmlFor={`${id}-locations`}>Number of operating locations</label>
        <input
          id={`${id}-locations`}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={5}
          value={text}
          onChange={(e) => setText(e.target.value)}
          aria-invalid={text !== "" && !valid}
          aria-describedby={`${id}-answer`}
          placeholder="For example, 3"
        />
        <div
          className="br-plan-fit-answer"
          id={`${id}-answer`}
          aria-live="polite"
        >
          {text === "" ? (
            <p>Enter your location count to find the matching capacity.</p>
          ) : !valid ? (
            <p>Enter a whole number of at least 1.</p>
          ) : plan && quote ? (
            <>
              <strong>
                {planName(plan)} fits {count}{" "}
                {count === 1 ? "location" : "locations"}.
              </strong>
              <p>
                {formatPublicPrice(quote.monthlyTotal)}/month, billed monthly.{" "}
                {formatPublicPrice(quote.commitmentTotal)} over the 12-month
                commitment, excluding VAT. Usage limits apply.
              </p>
              <Link href={`#plan-${plan}`}>Review {planName(plan)} →</Link>
            </>
          ) : (
            <>
              <strong>Enterprise fits {count} locations. Contact sales.</strong>
              <p>
                For 6+ locations or requirements outside standard usage, discuss
                pricing and scope before choosing a subscription.
              </p>
              <Link href="/contact?plan=enterprise">Contact sales →</Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
