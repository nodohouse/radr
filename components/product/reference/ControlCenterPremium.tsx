"use client";

import Link from "next/link";
import { EstateWatch } from "./EstateWatch";
import { AttentionBrief } from "./AttentionBrief";
import { ExecutivePulse } from "./ExecutivePulse";
import { useRecords } from "./ReferencePages";
import { roleContextFor } from "@/lib/radr/product/personas";
import { deriveValueAggregate } from "@/lib/radr/product/valueAggregate";
import { buildValueOverview } from "@/lib/radr/product/valueProofEngine";
import { formatDecisionMoney } from "@/lib/radr/decision/core";
import { formatPrimaryMetric } from "@/lib/radr/product/primaryMetric";
import { displayDecisionId } from "@/lib/radr/decision/ids";
import { lifecycleLabel } from "@/lib/radr/decision/lifecycle";
import { toCanonicalLocationId } from "@/lib/radr/product/locationIds";
import { BERLIN_GM_LIVE_STATE } from "@/lib/radr/product/restaurantGmControlCenterCanon";
import { sourceCurrency } from "@/lib/radr/product/demoMoney";
import { hotelGmPerformance } from "@/lib/radr/product/hotelGmDashboardCanon";
import { houseReadinessModel } from "@/lib/radr/product/houseReadiness";
import { getServiceCommand } from "@/lib/product/serviceCommand";
import type { DecisionRecord } from "@/lib/radr/decision/record";
import { NAV_ICONS } from "../shell/navIcons";
import { Arrow, Heading, Panel, StatusPill, TextLink } from "./ReferenceUI";

const EvidenceIcon = NAV_ICONS["data-health"];
const clean = (text: string) => text.replace(/\s*—\s*/g, ", ");
const decisionHref = (record: DecisionRecord) => `/app/decisions/${record.id}`;
const AREAS = [
  { id: "service", title: "Service & demand", hotel: "Rooms & arrivals", icon: "live", match: /capacity|service|seating|table|grill|readiness|arrival|room|demand/i, href: "/app/service", note: "Capacity, pace and readiness" },
  { id: "labor", title: "Team & labor", hotel: "Housekeeping & labor", icon: "service", match: /labor|staff|shift|housekeep|cleaning|overtime|roster/i, href: "/app/operations", note: "Staffing and operating constraints" },
  { id: "stock", title: "Stock & suppliers", hotel: "Supplies & maintenance", icon: "house", match: /BUY|stock|supplier|procure|inventory|sugar|linen|amenit|maintenance|leak/i, href: "/app/house", note: "Availability and purchasing evidence" },
  { id: "guest", title: "Guest experience", hotel: "Guest experience", icon: "guests", match: /guest|wait|complaint|review|reputation|refund|recovery|RECOVER/i, href: "/app/guests", note: "Guest impact and service recovery" },
  { id: "revenue", title: "Revenue & margin", hotel: "Revenue & distribution", icon: "value", match: /SELL|price|margin|channel|revenue|booking|menu|settlement|commission|cost/i, href: "/app/intelligence", note: "Demand, pricing and contribution" },
] as const;

function DecisionLine({ record }: { record: DecisionRecord }) {
  const metric = formatPrimaryMetric(record);
  return <Link className="cc-decision-line" href={decisionHref(record)}>
    <span className="cc-line-mark" aria-hidden="true">↗</span>
    <div><small>{displayDecisionId(record.id)} · {record.property}</small><strong>{record.title}</strong><p>{clean(record.recommendationHeadline || record.contextLine)}</p></div>
    <span className="cc-line-value"><b>{metric?.money || lifecycleLabel(record.status)}</b><small>{metric?.caption || "Review record"}</small></span><Arrow />
  </Link>;
}

function ReadinessFact({fact}:{fact:{label:string;value:string;risk?:boolean}}) {
  const ratio=fact.value.match(/^(\d+)\/(\d+)$/);
  const percentage=fact.value.endsWith("%")?Number.parseFloat(fact.value):ratio&&Number(ratio[2])>0?Number(ratio[1])/Number(ratio[2])*100:null;
  const Icon=/covers|arrivals/i.test(fact.label)?NAV_ICONS.guests:NAV_ICONS.value;
  return <div className="cc-readiness-instrument" data-risk={fact.risk||undefined}><span>{fact.label}</span><div className="cc-instrument-face">{percentage!==null&&Number.isFinite(percentage)?<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="40" className="cc-instrument-track"/><circle cx="50" cy="50" r="40" className="cc-instrument-progress" pathLength="100" strokeDasharray={`${Math.min(100,Math.max(0,percentage))} 100`} transform="rotate(-90 50 50)"/></svg>:<Icon/>}<strong>{fact.value}</strong></div></div>;
}

/** A scoped daily brief. Operating snapshots are explicitly tied to their demo venue. */
export function ControlCenterPremium() {
  const { roleView, vertical, records, summary, scopeLabel, locationScope, comparisonLocationIds } = useRecords();
  const context = roleContextFor(roleView, vertical);
  const needs = summary.groups.needs_you;
  const handling = summary.groups.handling;
  const watching = summary.groups.watching;
  const primary = needs[0];
  const aggregate = deriveValueAggregate(roleView, vertical, records);
  const value = buildValueOverview(roleView, vertical, records);
  const metric = primary ? formatPrimaryMetric(primary) : null;
  const active = [...needs, ...handling, ...watching];
  const evidence = [...new Map(records.flatMap(record => record.evidenceRefs).map(ref => [ref.id, ref])).values()];
  const uncertain = active.filter(record => record.confidence.data === "LOW" || record.evidenceRefs.some(ref => ["STALE", "MISSING", "UNKNOWN"].includes(ref.grade || "")));
  const service = getServiceCommand();
  const hotel = vertical === "hotel" ? houseReadinessModel() : null;
  const snapshotId = hotel?.locationId || BERLIN_GM_LIVE_STATE.locationId;
  const snapshotAvailable = comparisonLocationIds.length >= 2
    ? comparisonLocationIds.map(toCanonicalLocationId).includes(toCanonicalLocationId(snapshotId))
    : locationScope === "all" || toCanonicalLocationId(locationScope) === toCanonicalLocationId(snapshotId);
  const snapshotCurrency = sourceCurrency(snapshotId);
  const performance = hotel ? hotelGmPerformance() : null;
  const snapshotFacts = hotel && performance ? [
    { label: "Occupancy", value: `${performance.occupancyPct}%`, note: "Property performance snapshot" },
    { label: "Average daily rate", value: formatDecisionMoney(performance.adrEuro, snapshotCurrency), note: `ADR · ${snapshotCurrency} · today` },
    { label: "Revenue / available room", value: formatDecisionMoney(performance.revparEuro, snapshotCurrency), note: `RevPAR · ${snapshotCurrency} · today` },
    { label: "Rooms ready", value: `${hotel.ready}/${hotel.due}`, note: "Due in the arrival wave", risk: hotel.ready < hotel.due },
    { label: "Arrivals today", value: String(hotel.arrivalsToday), note: "Property snapshot" },
    { label: "Inspection backlog", value: String(hotel.capacity.inspectionBacklog), note: "Rooms awaiting inspection", risk: hotel.capacity.inspectionBacklog > 0 },
  ] : [
    { label: "Revenue today", value: formatDecisionMoney(BERLIN_GM_LIVE_STATE.revenueEuro, snapshotCurrency), note: `${BERLIN_GM_LIVE_STATE.revenueDeltaPct}% vs plan · ${snapshotCurrency}` },
    { label: "Contribution today", value: formatDecisionMoney(BERLIN_GM_LIVE_STATE.contributionEuro, snapshotCurrency), note: `${BERLIN_GM_LIVE_STATE.contributionDeltaPct}% vs plan · ${snapshotCurrency}` },
    { label: "Covers served", value: String(BERLIN_GM_LIVE_STATE.covers), note: `${BERLIN_GM_LIVE_STATE.coversDeltaPct}% vs plan` },
    { label: "Occupancy", value: service.kpis.find(kpi => kpi.id === "occupancy")?.value || "Unavailable", note: "Current dining-room occupancy" },
    { label: "Kitchen load", value: `${BERLIN_GM_LIVE_STATE.kitchenLoadNowPct}%`, note: `Peak forecast ${BERLIN_GM_LIVE_STATE.kitchenPeakPct}%`, risk: BERLIN_GM_LIVE_STATE.kitchenLoadNowPct >= 85 },
    { label: "Labor / revenue", value: `${BERLIN_GM_LIVE_STATE.laborPct}%`, note: `${BERLIN_GM_LIVE_STATE.laborDeltaPp} pp vs plan` },
  ];
  const cfo=roleView.includes("cfo");
  const importantFacts=snapshotFacts.filter(fact=>(hotel?(cfo?["Occupancy","Average daily rate","Revenue / available room","Rooms ready"]:["Rooms ready","Arrivals today","Inspection backlog","Occupancy"]):["Covers served","Occupancy","Kitchen load","Labor / revenue"]).includes(fact.label));
  return <div className="rs-page rs-center cc-command cc-executive" data-testid="compact-control-center">
    <ExecutivePulse vertical={vertical} scope={locationScope} comparison={comparisonLocationIds} heading={(onOpen,period)=><Heading eyebrow="Control Center" title={`Your operating brief, ${context.firstName}.`} description={`${scopeLabel} · ${context.shortLabel} · ${aggregate.currencyLabel}`} aside={<><AttentionBrief needs={needs} handling={handling} uncertain={uncertain.length} scopeLabel={scopeLabel}/><div className="cc-heading-actions"><EstateWatch period={period} vertical={vertical} scope={locationScope} comparison={comparisonLocationIds} onReview={()=>onOpen("locations")}/></div></>}/>}>
    <div className="cc-priority-grid">
      <section className="cc-priority" aria-labelledby="cc-priority-title"><header><span className="cc-section-label">YOUR NEXT MOVE</span><StatusPill tone={primary?"attention":"healthy"}>{needs.length?`${needs.length} awaiting judgment`:"No review pending"}</StatusPill></header>
       {primary?<><div className="cc-priority-meta"><span>{displayDecisionId(primary.id)} · {primary.property}</span><span>{primary.decisionDeadline||clean(primary.decisionHorizon.replaceAll("_"," ").toLowerCase())}</span></div><h2 id="cc-priority-title">{primary.title}</h2><p className="cc-priority-recommendation">{clean(primary.recommendationHeadline||primary.contextLine)}</p><div className="cc-decision-assurance"><span><i aria-hidden="true"/>{primary.confidence.userFacing.toLowerCase()} confidence</span><span>{primary.evidenceRefs.length} evidence items</span><span>{lifecycleLabel(primary.status)}</span></div><footer><div className="cc-compact-impact"><strong>{metric?.money||"Review impact"}</strong><small>{metric?.caption||"Evidence-linked decision"}</small></div><Link className="cc-primary-action" href={decisionHref(primary)}>Review decision <Arrow/></Link></footer></>:<div className="cc-priority-empty"><h2 id="cc-priority-title">No decisions awaiting judgment.</h2><TextLink href="/app/decisions">Explore decision record</TextLink></div>}
      </section>
      <Panel title={hotel?"Arrival readiness":"Service readiness"} action={<TextLink href="/app/service">Details</TextLink>} className="cc-readiness">{snapshotAvailable?<><div className="cc-snapshot-meta"><span>{hotel?.locationLabel||service.location}</span><StatusPill tone="neutral">Demo · {hotel?.clockLabel||service.liveTime}</StatusPill></div><div className="cc-readiness-facts">{importantFacts.map(fact=><ReadinessFact key={fact.label} fact={fact}/>)}</div><p className="cc-compact-readiness">{hotel?`${hotel.capacity.inspectionBacklog} rooms await inspection. Review the arrival wave.`:`${BERLIN_GM_LIVE_STATE.constraintStation} is the forecast constraint at ${BERLIN_GM_LIVE_STATE.constraintTime}.`}</p>{locationScope==="all"||comparisonLocationIds.length>=2?<small className="cc-scope-note">Featured venue, not an estate-wide total.</small>:null}</>:<div className="cc-snapshot-empty"><h3>No readiness snapshot for this selection.</h3><TextLink href="/app/locations">Review locations</TextLink></div>}</Panel>
    </div>
    <section className="cc-money-strip" aria-label="Decision value summary"><Link href="/app/decisions?band=needs_you"><span>Active exposure</span><strong>{formatDecisionMoney(aggregate.activeExposure,aggregate.currency)}</strong><small>Open decisions · mixed horizons</small><Arrow/></Link><Link href="/app/decisions?band=handling"><span>RADR is handling</span><strong>{handling.length}</strong><small>{formatDecisionMoney(aggregate.pendingVerification,aggregate.currency)} awaiting verification</small><Arrow/></Link><Link href="/app/value" className="cc-verified"><span>Verified contribution</span><strong>{value.verifiedFormatted}</strong><small>Month to date · evidence linked</small><Arrow/></Link><Link href="/app/data-health"><span>Evidence to review</span><strong>{uncertain.length}</strong><small>Active decisions with uncertain data</small><Arrow/></Link></section>
    </ExecutivePulse>

    <details className="cc-brief-details"><summary><span>Decision queue & operating context</span><small>{Math.max(0,needs.length-1)} next · {handling.length} in motion · {watching.length} watching</small></summary><section className="cc-compact-areas" id="cc-operating-picture" aria-label="Operating areas">{AREAS.map(area=>{const matches=active.filter(record=>area.match.test(`${record.title} ${record.decisionType} ${(record.territories||[]).join(" ")}`));const Icon=NAV_ICONS[area.icon];return <Link key={area.id} href={area.href}><Icon/><span>{vertical==="hotel"?area.hotel:area.title}<small>{matches.length} active records</small></span><Arrow/></Link>;})}<Link href="/app/data-health"><EvidenceIcon/><span>Evidence & trust<small>{evidence.length} evidence items</small></span><Arrow/></Link></section><div className="cc-work-grid"><Panel title="Next in your judgment queue" action={<TextLink href="/app/decisions?band=needs_you">All decisions</TextLink>}>{needs.slice(1,4).map(record=><DecisionLine key={record.id} record={record}/>)}{needs.length<=1?<p className="cc-empty-note">No additional decisions await judgment.</p>:null}</Panel><Panel title="Evidence behind the priority" action={<TextLink href="/app/data-health">Evidence health</TextLink>}>{primary?.evidenceRefs.slice(0,3).map(ref=><div className="cc-evidence-row" key={ref.id}><strong>{clean(ref.label)}</strong><p>{clean(ref.value)}</p><small>{ref.source} · {ref.freshness}</small></div>)}{!primary?<p className="cc-empty-note">Open a Decision to inspect its evidence.</p>:null}</Panel></div></details>
    <footer className="cc-footer-note"><span><NAV_ICONS.memory/>Decisions become operating memory.</span><TextLink href="/app/memory">Explore memory</TextLink></footer>
  </div>;
}
