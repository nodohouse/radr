"use client";

/**
 * Hero phone — rotates role projections via shared RadrPhone.
 */

import { useEffect, useState } from "react";
import {
  PHONE_CFO_RECOVER,
  PHONE_FOH,
  PHONE_GM_PERISHABLE,
  PHONE_VERIFIED,
  RadrPhone,
  type RadrPhoneState,
} from "@/components/marketing/scenes/home/RadrPhone";

const STATES: RadrPhoneState[] = [
  PHONE_CFO_RECOVER,
  PHONE_GM_PERISHABLE,
  PHONE_FOH,
  PHONE_VERIFIED,
];

export function HeroRadrPhone() {
  const [idx, setIdx] = useState(0);
  const state = STATES[idx] ?? STATES[0]!;

  useEffect(() => {
    const id = window.setInterval(() => {
      setIdx((i) => (i + 1) % STATES.length);
    }, 4200);
    return () => window.clearInterval(id);
  }, []);

  return <RadrPhone state={state} />;
}
