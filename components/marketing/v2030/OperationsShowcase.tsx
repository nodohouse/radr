"use client";
import { Link } from "@/i18n/navigation";
import { getServiceCommand } from "@/lib/product/serviceCommand";
import { PUBLIC_RESTAURANT as venue } from "@/lib/marketing/publicCanon";
import { RESTAURANT_OBJECTS } from "@/lib/marketing/hospitalityShowcase";
import { HospitalityLiveShowcase } from "./HospitalityLiveShowcase";
const model = getServiceCommand();
/** Restaurant and hotel Live share real synthetic product fixtures; capacity is the third beat. */
export function OperationsShowcase({
  section,
  onSectionChange,
}: {
  section: number;
  onSectionChange: (section: number) => void;
}) {
  if (section < 2)
    return (
      <HospitalityLiveShowcase
        kind={section === 1 ? "hotel" : "restaurant"}
        onKindChange={(kind) => onSectionChange(kind === "hotel" ? 1 : 0)}
      />
    );
  return (
    <div className="rsc-scene rso-scene" data-section={section}>
      <div className="rsc-heading">
        <div>
          <p>{venue.displayName} · Capacity & guest experience</p>
          <h3>Find the constraint. Protect the service.</h3>
        </div>
        <span className="rsc-section-marker">03 / 03</span>
      </div>
      <div className="rso-stations">
        <p>Kitchen capacity · demo snapshot</p>
        {model.kitchen.slice(0, 4).map((station) => (
          <div key={station.id}>
            <span>
              {station.name}
              <small>{station.queue} queued</small>
            </span>
            <strong>{station.load}%</strong>
            <div className="rso-load-track">
              <i
                style={{ width: `${station.load}%` }}
                data-high={station.load >= 90 || undefined}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="rsc-decision">
        <span className="rsc-signal">
          {venue.decisionId} · MODELED RESPONSE
        </span>
        <h4>Give the kitchen 12 minutes.</h4>
        <strong className="rso-value">{venue.expectedFormatted}</strong>
        <p>
          Expected protected tonight. A scenario estimate, not a completed
          result.
        </p>
        <Link href="/product?surface=operations" className="rsc-action">
          Review capacity <span>→</span>
        </Link>
      </div>
      <div className="rso-capacity-note">
        <strong>Guest context stays attached.</strong> Table 8 ·{" "}
        {RESTAURANT_OBJECTS[0]!.allergy} allergy · Reconfirm preparation with
        the kitchen. No live feed or provider actions.
      </div>
    </div>
  );
}
