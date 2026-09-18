# Pilot scenario test: Cancellation recovery

**Gold-standard vertical slice**  
**Venue:** Berlin Mitte (demo seed `loc_ber` / Table 14)  
**Rule:** Dashboard, Morning Brief, Service Map, Verified Value, and Butler MUST read the **same persisted evidence**. No parallel hard-coded Butler answers.

**Related:** `docs/RADR_PILOT_READINESS_AUDIT.md` · Finding engine · waitlist recovery · reconciliation · actions/verification services

---

## Business story

| Field | Value |
|-------|--------|
| Location | Berlin Mitte |
| Reservation | 4 guests · 20:00 · Table 14 |
| Expected booking value | €256 |
| Cancelled at | 17:42 |
| Waitlist party | 3 guests · requested 19:45–20:15 · expected €192 |
| Recommendation | Offer released inventory to matching waitlist party |
| Seated | ~19:58 |
| POS close | 21:36 · **€184** |
| Verified value | **€184** (not €192) |

Territory: RECOVER / SELL · Urgency: ACT NOW

---

## Required event timeline (finding detail)

| Time | Event |
|------|--------|
| 17:42 | Cancellation detected |
| 17:42 | €256 booking value exposed |
| 17:43 | Waitlist match identified |
| 17:44 | Recovery action recommended |
| 17:47 | Action accepted |
| 19:58 | Replacement party seated |
| 21:36 | POS check closed |
| 21:37 | €184 verified |

---

## Test procedure

### Setup

1. **Create reservation**  
   - partySize 4, serviceTime 20:00, table 14, status confirmed  
   - expectedBookingValue = 25600 minor EUR (or equivalent)  
   - Retain provider + externalId + provenance  

2. **Assign expected booking value**  
   - From spend profile × covers or explicit field  
   - Currency EUR  

3. **Create waitlist demand**  
   - partySize 3, requested window covering 20:00, expectedValue 19200 minor EUR  
   - status waiting  

### Detection

4. **Cancel reservation** at 17:42 (status cancelled, cancelledAt set)

5. **Confirm RADR detects cancellation**  
   - Finding created (or updated) with category cancellation / recovery  
   - Status OPEN · urgency ACT_NOW  

6. **Confirm financial exposure**  
   - Gross / booking value €256  
   - Exposure after natural rebook priors is explicit (do not equate full €256 to “lost”)  

7. **Confirm waitlist match**  
   - Match scores party size ≤ released covers and time proximity  
   - Potential recoverable €192  

8. **Confirm recommendation**  
   - Action title clear: match / offer waitlist to released inventory  
   - Expected benefit ≤ €192  

### Act

9. **Accept action**  
   - Action status → ACCEPTED (then ASSIGNED / IN_PROGRESS as designed)  
   - Audit: user, timestamp, findingId, actionId  

10. **Record replacement seating**  
    - Waitlist → matched / seated  
    - Linked reservation or seating event on Table 14  

### Verify

11. **Record POS order**  
    - total €184 · linked table / time / covers  
    - provenance retained  

12. **Reconcile POS to recovery event**  
    - Explicit link preferred; else scored match with confidence exposed  

13. **Calculate observed value** = €184  

14. **Create verification**  
    - expectedValue (counterfactual) ≤ €192  
    - observedValue €184  
    - verifiedValue = **min(expected, observed)** → €184  
    - attribution: RADR_RECOMMENDED or OPERATOR / UNCERTAIN as evidence allows  
    - Do **not** claim €192  

15. **Display Verified Value**  
    - Ledger stages: Identified → Actionable → Actioned → Recovered/Protected → Verified  
    - Finding timeline shows 21:37 verification  

16. **Show event in Morning Brief / history**  
    - Same findingId / verificationId  
    - Deep link to finding detail  

17. **Ask Butler:**  
    > How much did we recover from the Table 14 cancellation?

18. **Butler must answer using the same persisted evidence**  
    - Answer: €184 verified (not €192 potential)  
    - Evidence cites finding, action, POS order, verification IDs  
    - Confidence reflects match + data freshness  
    - Same numbers as Control Center / Value page  

---

## Pass criteria

| # | Criterion | Pass? |
|---|-----------|-------|
| A | Single source of truth for €184 across UI + Butler | |
| B | Potential €192 never shown as verified | |
| C | Timeline complete and ordered | |
| D | Audit trail for accept + verify | |
| E | Works in DEMO seed with DEMO label | |
| F | Works in LIVE/SANDBOX when adapters exist | |

---

## Current status (2026-08-27)

| Layer | Status |
|-------|--------|
| Demo fixtures (Table 14, waitlist, cancel economics) | Present |
| Finding rules (cancel + waitlist) | Library present |
| **Gold-standard scenario SoT** | `lib/radr/scenarios/*` |
| Finding timeline UI | `/app/findings/fnd_cancel_recovery_t14` |
| Value + Butler shared €184 | Wired |
| Action / verification services | Scenario store lifecycle |
| Postgres-persisted LIVE chain | Not implemented |

**Pass for DEMO:** Vitest `tests/cancellation-recovery.test.ts`.  
**Pass for LIVE:** still requires adapters + DB writers (checklist).

---

## Anti-patterns (fail immediately)

- Butler returns a hard-coded string unrelated to verification row  
- Verified Value shows €192 because “that was the waitlist expectation”  
- Service Map shows cancel but Finding engine has no matching finding  
- Refreshing the page loses action/verification state in LIVE mode  
- Mixing DEMO numbers into a LIVE org without DEMO badge  
