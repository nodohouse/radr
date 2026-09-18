# LAB Control Center — economic operating product

Sand/mint · acid green · triangle mark.

## Company thesis

RADR recovers value that hospitality businesses lose through fragmented operations.

**RECOVER → PREVENT → OPTIMIZE → AUTOPILOT**

Not a build-your-own-agent product. Not a chatbot. Not a dashboard generator.

RADR already knows: where hospitality loses money · what evidence matters · what Decisions are plausible · what actions are allowed · what counts as Verified.

## Five problem families

| Family | Stage | Pilot |
| --- | --- | --- |
| `SUPPLIER_AP` | Recover | Yes |
| `RECONCILIATION` | Recover | Yes |
| `COST_VARIANCE` | Prevent | Expansion |
| `PROCUREMENT` | Optimize | Expansion |
| `PERISHABLE_REVENUE` | Recover / live ops | Expansion |

Source: `lib/radr/problemFamilies.ts`

Each family has: signals · evidence · Decision types · actions · verification logic.

## Value states (visual)

| State | Color |
| --- | --- |
| IDENTIFIED | neutral / amber |
| EXPECTED | soft blue / amber |
| OBSERVED | graphite |
| VERIFIED | acid green |

Expected ≠ Verified. Verified total = sum of verified records in scope.

## Decision schema additions

`problemFamily` · `economicState` · `timeToExpiry` · `recoverability` · `verificationPath` · `requiredEvidence` · `allowedActions` · `alwaysAskActions`

## Control Center three-band law

1. **Shift Pulse** — value in / out / at risk / recovered · turbulence → Decision  
2. **Decision band** — Needs you or RADR is handling · Futures · Autopilot permission  
3. **Role band** — GM ops leakage · CFO recoveries · C-level themes  

Questions answered: Where is value leaking? What is about to expire? What needs me? What is RADR handling? What was verified?

## Role lenses

| Role | Focus |
| --- | --- |
| GM | Operational leakage · perishable revenue · Brief · Needs you |
| CFO | Supplier/AP · Reconciliation · recoveries · Verified Value · open exceptions |
| C-level | Top leak themes · recovered vs at-risk · exceptions |

## Autopilot

Permission: Suggest → Stage → Auto within policy  
Lifecycle: Prepared → Approved → Executed → Observed → Verified  
Never conflate Autopilot level with Verified.

## Mobile

Push-first · role-specific · actionable. Decision / approval / brief / exception / verification. Not a scheduling suite.

## Light mode

Sand / ivory · mint · acid green semantic · triangle only · no letter R · no dark boards.

## Homepage

Hero pain → five problem families → one recovery story → how RADR thinks → Recover→Prevent → stack → pilot → platform.

Banned public language: competitor callouts · feature parity · day one · sealed Trace · wedge · strategy-deck voice.
