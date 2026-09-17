# Control Center design

Operating surface for RADR lab: `/app/lab/control-center` plus Decisions, Catalog, Value, Memory.

Brand: sand canvas (`#f3f0ea`), mint bands (`#e8f7ef`), acid-green accents (`#00f56a` / `#00c853`). Triangle mark only — never a letter R. Full light mode. No near-black boards.

## Composition — three bands

Center is **not** a stack of equal-weight sections. After the thin chrome (rail + topbar) the board is:

1. **Shift Pulse (hero graph)** — full-width live time-series. One glance = how the shift / arrivals / recover window is tracking.
2. **Decision band** — one Needs-you hero + Futures **or** Autopilot status. One thing to act on.
3. **Role band** — the lens changes what is true:
   - **GM:** Who’s coming / FOH Brief + Sell / Labor pins
   - **CFO:** Win-loss + Recover + Verified ladder (floor map is not the hero)
   - **C-level:** Pulse summary + three money themes + Verified — minimal ops noise

My-module pins sit **below** the hero bands. Catalog / activity live on secondary routes or collapse into Catalog. Right rail stays thin: decide-by, health, recent.

## Shift Pulse metrics

One chart + legend. Sparklines are secondary (rail). Not a BI wall.

### Restaurant (`?seed=service`)

| Series | Meaning | Grade |
| --- | --- | --- |
| Money IN | Covers / seated contribution (running) | Expected until POS close |
| Money OUT | Delivery take + cancels/walk-aways + comps/voids/refunds | Expected |
| Net | IN − OUT | Expected |
| Forecast vs actual | Expected close if current path holds | Expected |

Turbulence markers (delivery spike, cancel cluster, kitchen 92%) open the Decision. Each marker carries because-line + D-id + € Expected/Verified.

Toggle: **Shift** (18:00–now) · **24h** (rolling service day).

### Hotel (`?seed=hotel`)

| Series | Meaning |
| --- | --- |
| Money IN | Arrivals, room revenue, upgrades/upsells |
| Money OUT | Cancels, no-shows, refunds, OTA distribution tax |
| Net | IN − OUT |
| Forecast / pickup | Occupancy + orphan-night risk until 20:00 |

Turbulence → channel hold / Recover (`D-3301`, `D-3308`).

### Recover (`?seed=recover`)

Rolling 14-day P&L: POS IN vs AP OUT. Variance marker `D-4102` · €273 Expected until credit memo posts.

## Autopilot levels

Progressive trust on the **active** Decision. LLMs explain; systems calculate. Demo actuators are labeled demo/policy. **Never fake Verified money.**

| Level | Label | Meaning |
| --- | --- | --- |
| 1 | Suggest | Recommend. Operator chooses. |
| 2 | Stage | Prepare work. Do **not** write systems of record. |
| 3 | Auto within policy | After enough similar **Verified** outcomes, run allowed actuators. |
| 4 | Verified | € sealed on ledger. Estimated ≠ verified. |

UI:

- **RADR will…** vs **Needs you** — interrupt only for exceptions, first-time patterns, or high €.
- Policy chip: what can auto (e.g. throttle delivery, hold next PO) vs always-ask (Instagram, dispute AP, refunds).
- After Approve / Auto: **execution receipt → Observed → Verified**. € stays Expected until Trace seals.
- Memory line, e.g. “Seen 12 similar Fridays · auto-stage allowed.”

Fixture mapping:

- Wait-12: level 2 Stage (12 similar Fridays · auto-stage allowed). Delivery throttle may auto; Instagram / add labor / kill delivery always-ask.
- Hotel orphan: level 2 Stage. Channel hold may auto; refunds always-ask.
- Recover AP: level 1 Suggest. Dispute AP always-ask until three Verified credit memos.

## Service Brief schema

Airline-style role packets for the next ~90 minutes. Open **FOH Brief** is the GM default; Chef / GM / CFO complete the set.

```ts
type BriefPacketId = "chef" | "foh" | "gm" | "cfo";

type BriefItem = {
  check: string;
  detail: string;
  because: string;
  when: string;
  euro?: number;
  grade?: "Expected" | "Observed" | "Verified";
  displayId?: string; // D-id when money is at stake
  status: "do" | "watch" | "done";
};

type ServiceBrief = {
  phase: "pre" | "mid";
  phaseLabel: string;
  deltaNote: string; // mid-service delta when Pulse turbulence or new Needs-you
  packets: Record<BriefPacketId, BriefPacket>;
};
```

- **Service seed:** Mid-service · +42m. Kitchen +18pts · inbound +12 · Wait-12 still open.
- **Hotel seed:** Arrivals · +42m. Late cancels / orphan nights.
- **Recover seed:** Monday morning packet; CFO hero is AP dispute.

## Seeds

| Seed | Path | Demo |
| --- | --- | --- |
| Restaurant service | `/app/lab/control-center?seed=service` | GM night-of: graph → D-1911 → FOH Brief |
| Hotel pulse | `/app/lab/control-center?seed=hotel` | Arrivals graph → D-3301 orphan / channel |
| Recover | `/app/lab/control-center?seed=recover` | CFO Monday: in/out/forecast → D-4102 |

Role tabs are not cosmetic: GM on the same seed sees floor + brief; CFO sees P&L + Recover + Verified ladder.

## Money law

- Every € on Pulse, Decision, Brief, Catalog, Value, Memory has a **because-line**.
- Turbulence / Decision € always include **D-id** + Expected or Verified.
- Verified Value ladder: Identified → Expected → Observed → Attributed → Verified.
- Estimated / Expected is **not** Verified. No invented ledger totals.

## Secondary pages

All sand/mint, readable ink (`#161412` / `#3f3b36` — not faint text on dark).

- **Decisions** — story cards: action · € · because · Why + Futures.
- **Catalog / My Center** — Buy · Sell · Labor · Recover (+ Value / Memory). Role “For you” emphasis. Readable cards.
- **Value** — embeds Shift Pulse + win/loss + ladder.
- **Memory** — tried → observed → verified → next time. Feeds autopilot confidence.

## Ban

Scattered equal-weight stacks · tiny Pulse chips as the hero · same UI for GM and CFO · vanity KPI walls · unreadable Catalog · fake Verified · letter-R logo · dark boards.
