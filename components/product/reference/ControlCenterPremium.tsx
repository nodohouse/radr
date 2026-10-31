"use client";

import Link from "next/link";
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
import { Arrow, Chart, Heading, Panel, StatusPill, TextLink } from "./ReferenceUI";

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
  const topEvidence = primary?.evidenceRefs.slice(0, 3) || [];
  const siteAttention = [...new Set(active.map(record => toCanonicalLocationId(record.locationId)))].map(id => {
    const rows = active.filter(record => toCanonicalLocationId(record.locationId) === id);
    const pending = needs.filter(record => toCanonicalLocationId(record.locationId) === id);
    return { id, record: pending[0] || rows[0], active: rows.length, needs: pending.length };
  }).sort((a,b) => b.needs-a.needs || b.active-a.active);


  return <div className="rs-page rs-center cc-command">
    <Heading eyebrow="Control Center" title={`The whole picture, ${context.firstName}.`} description={`${scopeLabel} · ${context.shortLabel} · ${aggregate.currencyLabel}`} aside={<TextLink href="/app/live">Open live operation</TextLink>} />

    <div className="cc-briefline"><span className="cc-briefline-dot" aria-hidden="true" /><p>{needs.length ? <><strong>{needs.length} {needs.length === 1 ? "decision needs" : "decisions need"} your judgment.</strong> {handling.length} in motion{watching.length ? `, ${watching.length} being watched` : ""}.</> : <><strong>No decisions waiting on you.</strong> Review readiness, evidence and results below.</>}</p><a href="#cc-operating-picture">See operating picture <span aria-hidden="true">↓</span></a></div>


    <div className="cc-priority-grid">
      <section className="cc-priority" aria-labelledby="cc-priority-title">
        <header><span className="cc-section-label">YOUR NEXT MOVE</span><StatusPill tone={primary ? "attention" : "healthy"}>{primary ? "Needs your judgment" : "No review pending"}</StatusPill></header>
        {primary ? <><div className="cc-priority-meta"><span>{displayDecisionId(primary.id)}</span><span>{primary.property}</span><span>{primary.decisionDeadline || clean(primary.decisionHorizon.replaceAll("_", " ").toLowerCase())}</span></div>
          <h2 id="cc-priority-title">{primary.title}</h2><p className="cc-priority-recommendation">{clean(primary.recommendationHeadline || primary.contextLine)}</p>
          <div className="cc-primary-economics"><strong>{metric?.money || "Review impact"}</strong><span>{metric?.caption || "Evidence-linked decision"}</span></div>
          <div className="cc-no-action"><span>If you do nothing</span><p>{clean(primary.noActionOutcome || primary.mainRiskNarrative || primary.problemStatement)}</p></div>
          <footer><Link className="cc-primary-action" href={decisionHref(primary)}>Review decision <Arrow /></Link><span>{primary.confidence.userFacing.toLowerCase()} confidence<br />Review approval requirements in the record</span></footer>
        </> : <div className="cc-priority-empty"><h2 id="cc-priority-title">Space to focus on the operation.</h2><p>No decisions require your judgment in this selection. That is not a claim that every operating area is healthy.</p><TextLink href="/app/decisions">Explore decision record</TextLink></div>}
      </section>
      <Panel title={hotel ? "Arrival readiness" : "Service readiness"} action={<TextLink href="/app/service">Open operations</TextLink>} className="cc-readiness">
        {snapshotAvailable ? <><div className="cc-snapshot-meta"><span>{hotel?.locationLabel || service.location}</span><StatusPill tone="neutral">Demo · {hotel?.clockLabel || service.liveTime}</StatusPill></div>
          <div className="cc-readiness-facts">{snapshotFacts.map(fact => <div key={fact.label} data-risk={fact.risk || undefined}><span>{fact.label}</span><strong>{fact.value}</strong><small>{fact.note}</small></div>)}</div>
          <div className="cc-readiness-note"><span aria-hidden="true"><Arrow /></span><p>{hotel ? `${clean(hotel.recommendation.body)} ${hotel.capacity.housekeepersOn}/${hotel.capacity.housekeepersShift} housekeepers on shift.` : `${BERLIN_GM_LIVE_STATE.constraintStation} is the forecast constraint at ${BERLIN_GM_LIVE_STATE.constraintTime}. Review capacity before releasing the next seating wave.`}</p></div>
          {locationScope === "all" || comparisonLocationIds.length >= 2 ? <small className="cc-scope-note">Featured venue snapshot, not an estate-wide readiness total.</small> : null}
        </> : <div className="cc-snapshot-empty"><span className="cc-line-mark"><NAV_ICONS.locations /></span><h3>No readiness snapshot for this selection.</h3><p>Decision records below remain scoped to your selection. Choose {hotel?.locationLabel || service.location} to explore its operating snapshot.</p><TextLink href="/app/locations">Review locations</TextLink></div>}
      </Panel>
    </div>

    <section className="cc-money-strip" aria-label="Decision value summary">
      <Link href="/app/decisions?band=needs_you"><span>Needs your judgment</span><strong>{needs.length}</strong><small>{aggregate.activeOpportunity > 0 ? `${formatDecisionMoney(aggregate.activeOpportunity, aggregate.currency)} expected value to create · not verified` : "Prioritized by role and location"}</small><Arrow /></Link>
      <Link href="/app/decisions?band=needs_you"><span>Active exposure</span><strong>{formatDecisionMoney(aggregate.activeExposure, aggregate.currency)}</strong><small>Open decisions · mixed time horizons</small><Arrow /></Link>
      <Link href="/app/decisions?band=handling"><span>Awaiting verification</span><strong>{formatDecisionMoney(aggregate.pendingVerification, aggregate.currency)}</strong><small>In-motion decisions · expected value</small><Arrow /></Link>
      <Link href="/app/value" className="cc-verified"><span>Verified contribution</span><strong>{value.verifiedFormatted}</strong><small>Month to date · evidence linked</small><Arrow /></Link>
    </section>


    <section className="cc-operating-picture" id="cc-operating-picture" aria-labelledby="cc-areas-title">
      <div className="cc-section-heading"><div><span className="cc-section-label">OPERATING PICTURE</span><h2 id="cc-areas-title">What matters across the operation.</h2></div><p>Active decision coverage in your selection.<br />A decision can touch more than one area.</p></div>
      <div className="cc-area-grid">{AREAS.map(area => {
        const matches = active.filter(record => area.match.test(`${record.title} ${record.decisionType} ${(record.territories || []).join(" ")} `));
        const needsCount = matches.filter(record => needs.includes(record)).length;
        const Icon = NAV_ICONS[area.icon];
        return <Link className="cc-area" key={area.id} href={matches[0] ? decisionHref(matches[0]) : area.href}><span className="cc-area-icon"><Icon /></span><span className="cc-area-title">{vertical === "hotel" ? area.hotel : area.title}</span><span className="cc-area-count"><strong>{matches.length}</strong> active {matches.length === 1 ? "record" : "records"}</span><p>{matches[0] ? matches[0].title : "No active decision records in this area. Operating status has not been independently confirmed."}</p><span className="cc-area-bottom">{needsCount ? `${needsCount} ${needsCount === 1 ? "needs" : "need"} judgment` : matches.length ? "Review current records" : area.note}<Arrow /></span></Link>;
      })}
        <Link href="/app/data-health" className="cc-area cc-area-evidence"><span className="cc-area-icon"><EvidenceIcon /></span><span className="cc-area-title">Evidence & trust</span><span className="cc-area-count"><strong>{evidence.length}</strong> evidence items</span><p>{uncertain.length ? `${uncertain.length} active ${uncertain.length === 1 ? "decision has" : "decisions have"} low data confidence or stale, missing or unknown evidence.` : "Review source freshness and confidence before relying on a recommendation."}</p><span className="cc-area-bottom">{uncertain.length ? "Evidence review needed" : "Open evidence health"}<Arrow /></span></Link>
      </div>
    </section>

    {siteAttention.length > 1 ? <Panel title="Where attention is concentrated" action={<TextLink href="/app/locations">Explore estate</TextLink>} className="cc-estate-focus"><p className="cc-panel-description">Locations and group contexts represented by active decisions in this selection.</p><div className="cc-estate-list">{siteAttention.slice(0,6).map(site=><Link key={site.id} href={decisionHref(site.record)}><span className="cc-area-icon"><NAV_ICONS.locations /></span><div><strong>{site.record.property}</strong><small>{site.active} active {site.active===1?"decision":"decisions"}</small></div><StatusPill tone={site.needs?"attention":"neutral"}>{site.needs?`${site.needs} awaiting judgment`:"In motion / watching"}</StatusPill><Arrow /></Link>)}</div>{siteAttention.length>6?<p className="cc-scope-note">Showing six contexts with the most decisions needing judgment, then active decision count. Explore Locations for the full estate.</p>:null}</Panel>:null}

    <div className="cc-work-grid">
      <Panel title="Next in your judgment queue" action={<TextLink href="/app/decisions?band=needs_you">All {needs.length} decisions</TextLink>} className="cc-queue">
        {needs.slice(1, 4).map(record => <DecisionLine record={record} key={record.id} />)}
        {needs.length <= 1 ? <div className="cc-empty-note">{primary ? "Your priority Decision above is the only one awaiting your judgment." : "No decisions await judgment in this selection."}</div> : null}
      </Panel>
      <Panel title="RADR is handling" action={<span className="cc-count">{handling.length}</span>} className="cc-handling">
        <p className="cc-panel-description">Prepared and in-motion work. Execution and verification remain distinct.</p>
        {handling.slice(0, 3).map(record => <Link className="cc-handling-row" key={record.id} href={decisionHref(record)}><span className="cc-handling-dot" aria-hidden="true" /><div><small>{displayDecisionId(record.id)} · {lifecycleLabel(record.status)}</small><strong>{record.title}</strong><p>{clean(record.actionPlan.payloadNote || record.recommendationHeadline || record.contextLine)}</p></div><Arrow /></Link>)}
        {!handling.length ? <div className="cc-empty-note">No decisions currently in motion in this selection.</div> : null}
        <TextLink href="/app/decisions?band=handling">Follow work in motion</TextLink>
      </Panel>
    </div>

    <div className="cc-proof-grid">
      <Panel title="Value that made it back to the table" action={<StatusPill tone="healthy">Verified · month to date</StatusPill>} className="cc-proof">
        <div className="cc-proof-headline"><strong>{value.verifiedFormatted}</strong><p>{value.decisionCount} positive-value outcomes linked to evidence.<br />Expected value stays separate until verified.</p></div>
        <Chart values={value.trend.map(point => point.cumulative)} labels={value.trend.map(point => point.label)} caption={`Cumulative verified contribution, month to date, ${aggregate.currency}`} />
        <div className="rs-chart-legend"><i />{scopeLabel} · {aggregate.currency}<TextLink href="/app/value">Explore value record</TextLink></div>
      </Panel>
      <div className="cc-watch-stack"><Panel title="On the radar" action={<span className="cc-count">{watching.length}</span>}>
        {watching.slice(0, 3).map(record => <Link key={record.id} className="cc-watch-row" href={decisionHref(record)}><span className="cc-watch-icon" aria-hidden="true">◉</span><div><strong>{record.title}</strong><small>{clean(record.contextLine)}</small></div><Arrow /></Link>)}
        {!watching.length ? <p className="cc-empty-note">No watched decisions in this selection. New evidence may change the picture.</p> : null}<TextLink href="/app/decisions?band=watching">Review watching</TextLink>
      </Panel><Panel title="Evidence behind the priority" action={primary ? <span className="rs-meta">{displayDecisionId(primary.id)}</span> : undefined}>
        {topEvidence.map(ref => <div className="cc-evidence-row" key={ref.id}><span className="cc-evidence-source">{ref.source}</span><strong>{clean(ref.label)}</strong><p>{clean(ref.value)}</p><small>{ref.freshness}</small></div>)}
        {!topEvidence.length ? <p className="cc-empty-note">Open a Decision to inspect its source evidence and uncertainty.</p> : null}
        {primary ? <TextLink href={decisionHref(primary)}>Inspect full evidence chain</TextLink> : <TextLink href="/app/data-health">Review evidence health</TextLink>}
      </Panel></div>
    </div>
    <footer className="cc-footer-note"><span><NAV_ICONS.memory />Decisions become operating memory.</span><TextLink href="/app/memory">Explore what RADR has learned</TextLink></footer>
  </div>;
}
