# RADR Control Center — design

Hospitality autopilot: execute so people can do hospitality; learn from each Decision; interrupt as little as possible.

This lab is the composed operating system. It is not a stacked 8/4 dashboard.

## Composition — three bands only

```
┌─────────────────────────────────────────────┬──────────┐
│ 1. SHIFT PULSE (hero graph, full width)     │ Decide-by│
│    live in / out / net / forecast           │ Health   │
├─────────────────────────────────────────────┤ Recent   │
│ 2. DECISION                                 │          │
│    one Needs-you hero  +  Futures / Auto    │          │
├─────────────────────────────────────────────┤          │
│ 3. ROLE                                     │          │
│    GM floor · CFO win/loss · C-level themes │          │
└─────────────────────────────────────────────┴──────────┘
         pins / catalog  (below the fold)
```

- **Pulse** is the only hero number surface. One chart, one legend, turbulence triangles.
- **Decision** is the only interrupt. One active Decision. Futures or Autopilot status — not both as equals.
- **Role** changes the third band. GM / CFO / C-level are not cosmetic chips.
- Catalog, modules, activity live on secondary routes that **fill the canvas**: Catalog is a 3-column sand/mint story board; My Center / Decisions / Memory / Value are 2-column large story cards — no left-narrow / right-blank.
- Right rail stays thin: decide-by, health, recent. Pulse is full-bleed above it.
- Center is three bands only. Pins live on My Center, not stacked under Pulse.

Ban: equal-weight stacks, Pulse-as-chips, same UI for GM and CFO, vanity KPIs, faint text on dark, letter-R logo.

## Brand

- Canvas: sand `#f3efe6` + mint wash `#e8f4ee`. Full light everywhere.
- Signal: acid green `#00f56a` / `#00c85a`. Ink `#1a1814`.
- Logo: triangle only (`M50 8 L90 81 H10 Z`). Never a letter R mark.
- Taxonomy on every money story: **Buy · Sell · Labor · Recover**.
- Every € carries a **because-line** and a grade: **EXPECTED** vs **VERIFIED**.

## Shift Pulse — metrics by industry

One time-series. Toggle **Shift** (rolling service day) vs **24h**.

### Restaurant

| Series | Meaning |
|---|---|
| Money IN | Covers / seated contribution (running) |
| Money OUT | Delivery take, cancels / walk-aways, comps / voids / refunds |
| Net | Contribution so far — Expected until close |
| Forecast | Expected close vs current pace |
| Turbulence | Delivery spike, cancel cluster, kitchen load → Decision |

### Hotel

| Series | Meaning |
|---|---|
| Money IN | Arrivals, room revenue, upgrades / upsells |
| Money OUT | Cancellations, no-shows, refunds, OTA distribution tax |
| Net | House contribution — Expected until night audit |
| Forecast | Pickup / occupancy vs orphan-night risk |
| Turbulence | Channel / hold / Recover (no-show deposit) |

Rules:

- Sparklines are not a substitute for the hero graph.
- Every turbulence point: because-line + D-id + € Expected/Verified.
- Click opens the Decision. This is not a BI chart wall.

## Role lenses

| Lens | Pulse | Decision | Role band | Pins |
|---|---|---|---|---|
| **GM** | Ops tracking | Needs-you + Futures | Who’s coming / FOH Brief | Sell + Labor |
| **CFO** | P&L in / out / net / forecast | Recover / Buy hero | Win-loss + Recover | Recover + Buy + Value |
| **C-level** | Summary | Top money Decision | Three themes + Verified | Value + material |

CFO does not get a floor map as hero. C-level does not get ops noise.

## Autopilot — progressive trust

North star: hospitality autopilot.

| Level | Name | Meaning |
|---|---|---|
| 1 | **Suggest** | RADR will… recommendation only |
| 2 | **Stage** | Confirm prepare — do **not** write to SoR |
| 3 | **Auto within policy** | After enough similar Verified outcomes |
| 4 | **Verified** | € sealed with lineage |

UI contract:

- Copy is **“RADR will…”** vs **“Needs you”**.
- Interrupt only for exceptions, first-time patterns, or high €.
- Policy chips: what can auto-run (e.g. throttle delivery) vs always-ask (Instagram, dispute AP, guest charge).
- After Approve / Auto: **execution receipt → Observed → Verified**.
- Illustrative actuators are labeled **demo / policy**. They never mint Verified money.
- Memory feeds confidence: “Seen 12 similar Fridays · auto-stage allowed.”

Always-ask (this lab):

- Post to Instagram
- Dispute AP / draft credit / short-pay / write remittance
- Charge a guest folio / no-show deposit

May auto within policy (after similar Verified nights):

- Throttle delivery intake
- Hold published labor roster
- Close last-room OTA allotment (staged)

## Service Brief schema

Airline-style role packet for the next ~90 minutes.

```
ServiceBrief
  phase: pre | mid
  phaseLabel: string
  deltaNote: string          // mid-service when Pulse turbulence or new Needs-you
  packets: Record<BriefRole, BriefPacket>

BriefRole = chef | foh | gm | cfo

BriefPacket
  title, horizon, lead
  items[]: check, detail, because, when,
           euro?, grade?, displayId?, decisionId?, status: do | watch | done
```

FOH Brief is the GM night-of path. All four roles ship. Mid-service delta appears when Pulse has turbulence or a new Needs-you.

## Verified Value / RECOVER honesty

€ **Verified** only with lineage:

- AP credit: `credit_memo.applied` to invoice / payment (or statement balance tied to the dispute pack).
- Delivery clawback: platform adjustment credits the merchant.
- Hotel no-show: charge settles on folio / processor.
- Sell-side protection: POS close + stock adjustment matched (demo gold: D-1842).

Never treat demo math, modeled attribution, or “Expected if path holds” as Verified.

RECOVER is cash/margin restoration (credit memo, clawback, uncharged deposit) — not “food cost feels high,” not BUY renegotiation, not a vanity void rate.

## Seeds & demo paths

| Seed | URL | Story |
|---|---|---|
| Restaurant service | `/app/lab/control-center?seed=service` | Friday 18:42 · Wait-12 |
| Hotel pulse | `/app/lab/control-center?seed=hotel` | Arrivals 16:10 · OTA hold + no-show |
| Recover | `/app/lab/control-center?seed=recover` | Monday AP credit · INV-88421 |

**GM night-of:** graph (turbulence △) → D-1911 Decision → Open FOH Brief.

**CFO Monday:** Pulse in/out/forecast → Recover D-4102 → Trace / Value ledger.

Secondary: Decisions, Catalog (`/app/lab/my-center`), Value, Memory, Service Brief (`/app/lab/service`). All sand/mint, story cards (action · € · because · CTA).
