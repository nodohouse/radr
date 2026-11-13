"use client";
import { useId, useState } from "react";
import { Link } from "@/i18n/navigation";
import { planForLocations, planName } from "@/lib/marketing/conversionJourney";
import "@/app/buyer-guide.css";
export function PricingFitGuide() {
  const id = useId();
  const [text, setText] = useState("");
  const count = /^\d{1,5}$/.test(text) ? Number(text) : NaN;
  const valid = Number.isSafeInteger(count) && count >= 1;
  const plan = valid ? planForLocations(count) : null;
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
          ) : plan ? (
            <>
              <strong>
                {planName(plan)} fits {count}{" "}
                {count === 1 ? "location" : "locations"}.
              </strong>
              <p>
                This matches location capacity. Prices and usage allowances
                remain pending.
              </p>
              <Link href={`#plan-${plan}`}>Review {planName(plan)} →</Link>
            </>
          ) : (
            <>
              <strong>Your footprint is above the standard packages.</strong>
              <p>
                The published package scope stops at 20 locations. Explore the
                demo to assess the product; larger capacity is not offered here.
              </p>
              <Link href="/demo">Explore the demo →</Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
