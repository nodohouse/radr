"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CURRENCIES, ONBOARDING_COUNTRIES } from "@/lib/constants";

export function OnboardingForm() {
  const router = useRouter();
  const [country, setCountry] = useState<string>(ONBOARDING_COUNTRIES[0].code);
  const [currency, setCurrency] = useState<string>(ONBOARDING_COUNTRIES[0].currency);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const countryOptions = useMemo(() => ONBOARDING_COUNTRIES, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const form = new FormData(event.currentTarget);

    const payload = {
      organizationName: String(form.get("organizationName") ?? ""),
      locationName: String(form.get("locationName") ?? ""),
      country: String(form.get("country") ?? ""),
      currency: String(form.get("currency") ?? ""),
    };

    const response = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setPending(false);

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;
      setError(data?.error ?? "Could not complete onboarding");
      return;
    }

    router.push("/home?welcome=1");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="prep-label" htmlFor="organizationName">
          Restaurant / organization name
        </label>
        <input
          id="organizationName"
          name="organizationName"
          required
          minLength={2}
          maxLength={120}
          className="prep-input"
          placeholder="e.g. House Kitchen Group"
        />
      </div>
      <div>
        <label className="prep-label" htmlFor="locationName">
          Location name
        </label>
        <input
          id="locationName"
          name="locationName"
          required
          minLength={2}
          maxLength={120}
          className="prep-input"
          placeholder="e.g. Canal Street"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="prep-label" htmlFor="country">
            Country
          </label>
          <select
            id="country"
            name="country"
            className="prep-input"
            value={country}
            onChange={(event) => {
              const next = event.target.value;
              setCountry(next);
              const meta = countryOptions.find((c) => c.code === next);
              if (meta) setCurrency(meta.currency);
            }}
          >
            {countryOptions.map((option) => (
              <option key={option.code} value={option.code}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="prep-label" htmlFor="currency">
            Currency
          </label>
          <select
            id="currency"
            name="currency"
            className="prep-input"
            value={currency}
            onChange={(event) => setCurrency(event.target.value)}
          >
            {CURRENCIES.map((code) => (
              <option key={code} value={code}>
                {code}
              </option>
            ))}
          </select>
        </div>
      </div>
      {error ? <p className="text-sm text-[var(--danger)]">{error}</p> : null}
      <button type="submit" className="prep-btn prep-btn-primary w-full" disabled={pending}>
        {pending ? "Saving…" : "Enter RADR"}
      </button>
    </form>
  );
}
