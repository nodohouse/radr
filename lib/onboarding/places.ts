/**
 * City → country / currency / timezone inference for onboarding.
 */

import { ONBOARDING_COUNTRIES } from "@/lib/constants";

export type PlaceHint = {
  city: string;
  countryCode: string;
  countryName: string;
  currency: string;
  timezone: string;
};

const PLACES: PlaceHint[] = [
  { city: "Amsterdam", countryCode: "NL", countryName: "Netherlands", currency: "EUR", timezone: "Europe/Amsterdam" },
  { city: "Rotterdam", countryCode: "NL", countryName: "Netherlands", currency: "EUR", timezone: "Europe/Amsterdam" },
  { city: "Utrecht", countryCode: "NL", countryName: "Netherlands", currency: "EUR", timezone: "Europe/Amsterdam" },
  { city: "Berlin", countryCode: "DE", countryName: "Germany", currency: "EUR", timezone: "Europe/Berlin" },
  { city: "Munich", countryCode: "DE", countryName: "Germany", currency: "EUR", timezone: "Europe/Berlin" },
  { city: "Hamburg", countryCode: "DE", countryName: "Germany", currency: "EUR", timezone: "Europe/Berlin" },
  { city: "Paris", countryCode: "FR", countryName: "France", currency: "EUR", timezone: "Europe/Paris" },
  { city: "Lyon", countryCode: "FR", countryName: "France", currency: "EUR", timezone: "Europe/Paris" },
  { city: "London", countryCode: "GB", countryName: "United Kingdom", currency: "GBP", timezone: "Europe/London" },
  { city: "Manchester", countryCode: "GB", countryName: "United Kingdom", currency: "GBP", timezone: "Europe/London" },
  { city: "Brussels", countryCode: "BE", countryName: "Belgium", currency: "EUR", timezone: "Europe/Brussels" },
  { city: "Antwerp", countryCode: "BE", countryName: "Belgium", currency: "EUR", timezone: "Europe/Brussels" },
  { city: "Dublin", countryCode: "IE", countryName: "Ireland", currency: "EUR", timezone: "Europe/Dublin" },
  { city: "Madrid", countryCode: "ES", countryName: "Spain", currency: "EUR", timezone: "Europe/Madrid" },
  { city: "Barcelona", countryCode: "ES", countryName: "Spain", currency: "EUR", timezone: "Europe/Madrid" },
  { city: "Rome", countryCode: "IT", countryName: "Italy", currency: "EUR", timezone: "Europe/Rome" },
  { city: "Milan", countryCode: "IT", countryName: "Italy", currency: "EUR", timezone: "Europe/Rome" },
  { city: "Lisbon", countryCode: "PT", countryName: "Portugal", currency: "EUR", timezone: "Europe/Lisbon" },
  { city: "New York", countryCode: "US", countryName: "United States", currency: "USD", timezone: "America/New_York" },
];

export function searchPlaces(query: string, limit = 8): PlaceHint[] {
  const q = query.trim().toLowerCase();
  if (!q) return PLACES.slice(0, limit);
  return PLACES.filter((p) => p.city.toLowerCase().includes(q)).slice(0, limit);
}

export function resolveCountry(code: string) {
  return ONBOARDING_COUNTRIES.find((c) => c.code === code) ?? ONBOARDING_COUNTRIES[0];
}

export function inferFromCity(city: string): PlaceHint | null {
  const hit = PLACES.find(
    (p) => p.city.toLowerCase() === city.trim().toLowerCase(),
  );
  return hit ?? null;
}
