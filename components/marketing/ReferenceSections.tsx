"use client";


import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import "./reference-sections.css";

type IconName =
  | "pos"
  | "hotel"
  | "finance"
  | "procurement"
  | "labor"
  | "plus"
  | "signal"
  | "check"
  | "arrow";
function Icon({ name, size = 24 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    pos: (
      <>
        <rect x="5" y="5" width="14" height="16" rx="3" />
        <path d="M9 5V3h6v2M9 10h6M9 14h3M15 16v2" />
      </>
    ),
    hotel: (
      <>
        <path d="M4 20V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v13M4 15h16M8 15v-4h8v4M4 19h16M8 8h1m6 0h1" />
      </>
    ),
    finance: (
      <>
        <ellipse cx="12" cy="5" rx="7" ry="3" />
        <path d="M5 5v13c0 4 14 4 14 0V5M5 10c0 4 14 4 14 0M5 14c0 4 14 4 14 0" />
      </>
    ),
    procurement: (
      <>
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <path d="M9 4V2h6v2M9 9h6M9 13h6M9 17h4" />
      </>
    ),
    labor: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M3 21v-3a6 6 0 0 1 12 0v3M16 5a3 3 0 0 1 0 6M18 15c3 0 4 2 4 5" />
      </>
    ),
    plus: <path d="M12 4v16M4 12h16" />,
    signal: (
      <>
        <path d="M4 19V8l8-5 8 5v11H4Z" />
        <path d="M9 19v-7h6v7M10 8h4" />
      </>
    ),
    check: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="m8 12 3 3 5-6" />
      </>
    ),
    arrow: <path d="M4 12h15m-5-5 5 5-5 5" />,
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
const systems: { label: string; icon: IconName }[] = [
  { label: "POS", icon: "pos" },
  { label: "PMS", icon: "hotel" },
  { label: "Finance", icon: "finance" },
  { label: "Procurement", icon: "procurement" },
  { label: "Labor", icon: "labor" },
];

export function ConnectSystems() {
  return (
    <section className="rs-connect" aria-labelledby="systems-title">
      <div className="rs-container rs-connect-grid">
        <div>
          <div className="rs-divider-label">
            <span />
            <h2 id="systems-title">CONNECT YOUR SYSTEMS</h2>
            <span />
          </div>
          <div className="rs-system-tiles">
            {[...systems, { label: "And more", icon: "plus" as IconName }].map(
              (system) => (
                <div key={system.label} className="rs-system-tile">
                  <Icon name={system.icon} />
                  <span>{system.label}</span>
                </div>
              ),
            )}
          </div>
        </div>
        <p>
          RADR connects to your existing systems, understands your operating
          state, and prepares better decisions, so you can act with control and
          verify what happened.
        </p>
      </div>
    </section>
  );
}

export { DecisionGap } from "./DecisionGap";

const decisionStages = [
  {
    name: "Evidence",
    title: "Overcharge detected",
    description:
      "A supplier price variance has been detected across 3 locations.",
    heading: "Recommended action",
    action: "Prepare dispute package",
    items: [
      "Compile evidence",
      "Generate supplier communication",
      "Track to resolution",
    ],
  },
  {
    name: "State",
    title: "One connected operating state",
    description:
      "Contract terms and invoice data reveal the same variance across 3 locations.",
    heading: "Connected context",
    action: "Compare the agreed price",
    items: [
      "Contract price: $6.80/L",
      "Invoice price: $7.45/L",
      "Variance: $0.65 per litre",
    ],
  },
  {
    name: "Futures",
    title: "See what could happen next",
    description:
      "Compare the potential outcomes before deciding how to respond.",
    heading: "Model the next step",
    action: "Review recovery potential",
    items: [
      "Validate the affected volume",
      "Compare available responses",
      "Estimate the opportunity",
    ],
  },
  {
    name: "Recommendation",
    title: "A clear next step",
    description:
      "Review the supporting evidence and prepare a supplier dispute for approval.",
    heading: "Recommended action",
    action: "Prepare dispute package",
    items: [
      "Compile evidence",
      "Generate supplier communication",
      "Track to resolution",
    ],
  },
  {
    name: "Action",
    title: "Act with control",
    description:
      "Prepare the next step with evidence attached. Your team reviews and approves the response.",
    heading: "Human approval",
    action: "Review before sending",
    items: [
      "Evidence stays attached",
      "An owner stays accountable",
      "Nothing is sent from this demo",
    ],
  },
  {
    name: "Verification",
    title: "Close the loop",
    description:
      "Track the outcome against the original evidence, then verify what actually changed.",
    heading: "Verify the outcome",
    action: "Track to resolution",
    items: [
      "Check the supplier response",
      "Confirm any credit received",
      "Record the verified outcome",
    ],
  },
];

export function DecisionPreview() {
  const [stage, setStage] = useState(0);
  const current = decisionStages[stage];
  return (
    <section
      className="rs-section rs-work"
      id="platform"
      aria-labelledby="work-title"
    >
      <div className="rs-container rs-two-column">
        <div className="rs-copy">
          <p className="rs-eyebrow">SEE RADR AT WORK</p>
          <h2 id="work-title">
            From signals
            <br />
            to decisions.
          </h2>
          <p>
            RADR detects what matters, explains why, compares possible futures
            and recommends the best action, so you can move from reactive to in
            control.
          </p>
          <Link className="rh-button rs-work-link" href="/how">
            See the platform <Icon name="arrow" size={18} />
          </Link>
        </div>
        <div className="rs-decision">
          <div className="rs-decision-category">
            <span className="rs-decision-avatar">
              <Image
                src="/brand/radr-mark-clean-white.svg"
                width={16}
                height={16}
                alt="RADR"
              />
            </span>
            <span>SUPPLIER / AP</span>
            <small>ILLUSTRATIVE EXAMPLE</small>
          </div>
          <div className="rs-decision-grid">
            <div className="rs-evidence" aria-live="polite">
              <h3>{current.title}</h3>
              <p>{current.description}</p>
              <div className="rs-evidence-metrics">
                <div>
                  <span>Contract</span>
                  <strong>$6.80/L</strong>
                </div>
                <div>
                  <span>Invoiced</span>
                  <strong>$7.45/L</strong>
                </div>
                <div>
                  <span>Exposure</span>
                  <strong>$2,430</strong>
                </div>
              </div>
            </div>
            <div className="rs-recommendation">
              <h4>{current.heading}</h4>
              <strong>
                <Icon name="check" size={16} />
                {current.action}
              </strong>
              <ul>
                {current.items.map((item) => (
                  <li key={item}>
                    <span aria-hidden="true">◇</span>
                    {item}
                  </li>
                ))}
              </ul>
              <button
                className="rs-action-button"
                onClick={() => setStage(stage === 4 ? 5 : 4)}
              >
                {stage === 4 ? "See verification" : "Take action"}
                <Icon name="arrow" size={16} />
              </button>
            </div>
          </div>
          <div
            className="rs-stage-buttons"
            role="group"
            aria-label="Explore the decision stages"
          >
            {decisionStages.map((item, i) => (
              <button
                key={item.name}
                aria-pressed={stage === i}
                onClick={() => setStage(i)}
              >
                {i === 0 && <Icon name="check" size={15} />} {item.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Hospitality() {
  const [selected, setSelected] = useState("Restaurant");
  const operations = [
    {
      name: "Restaurant",
      icon: "pos" as IconName,
      image: "/images/radr-restaurant.webp",
      alt: "Warmly lit coastal restaurant with glass walls and an olive-lined terrace",
      items: [
        "Food cost variance",
        "Supplier discrepancies",
        "Labor optimization",
        "Revenue opportunities",
      ],
    },
    {
      name: "Hotel",
      icon: "hotel" as IconName,
      image: "/images/radr-coastal-architecture.webp",
      alt: "Contemporary coastal resort with a travertine terrace and infinity pool",
      items: [
        "Group rate leakage",
        "F&B profitability",
        "Labor productivity",
        "Ancillary revenue",
      ],
    },
  ];
  return (
    <section
      className="rs-section rs-hospitality"
      id="hospitality"
      aria-labelledby="hospitality-title"
    >
      <div className="rs-container rs-two-column">
        <div className="rs-copy">
          <p className="rs-eyebrow">BUILT FOR HOSPITALITY</p>
          <h2 id="hospitality-title">
            Your world.
            <br />
            In sharper focus.
          </h2>
          <p>
            A busy dining room. A full-service hotel. A portfolio of both.
            Bring the decisions behind every service, stay and location into focus.
          </p>
        </div>
        <div
          className="rs-operation-cards"
          role="group"
          aria-label="Explore hospitality operations"
        >
          {operations.map((operation) => (
            <button
              key={operation.name}
              className="rs-operation-card"
              aria-pressed={selected === operation.name}
              onClick={() => setSelected(operation.name)}
            >
              <span className="rs-operation-title">
                <Icon name={operation.icon} size={21} />
                {operation.name}
              </span>
              <span className="rs-operation-image">
                <Image src={operation.image} alt={operation.alt} fill sizes="(max-width: 700px) 90vw, 650px" />
              </span>
              <span className="rs-operation-items">
                {operation.items.map((item, i) => (
                  <span key={item}>
                    <Icon name={i === 0 ? "finance" : "labor"} size={17} />
                    {item}
                  </span>
                ))}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export function ValueMap() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [revenue, setRevenue] = useState(250000);
  const [procurement, setProcurement] = useState(75000);
  const [labor, setLabor] = useState(65000);
  const [improvement, setImprovement] = useState(2);
  const estimate = ((revenue + procurement + labor) * improvement) / 100;
  const format = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  return (
    <section
      className="rs-section rs-value"
      id="value-map"
      aria-labelledby="value-title"
    >
      <div className="rs-container rs-two-column">
        <div className="rs-copy">
          <p className="rs-eyebrow">RADR VALUE MAP</p>
          <h2 id="value-title">
            What is your operation
            <br />
            leaving behind?
          </h2>
          <p>
            Model where value may be hiding across labor, procurement, revenue
            and operations, then see what may be worth investigating first.
          </p>
          <button
            className="rh-button rs-value-button"
            onClick={() => dialog.current?.showModal()}
          >
            Build my Value Map <Icon name="arrow" size={18} />
          </button>
        </div>
        <div
          className="rs-value-visual"
          aria-label="Illustrative value map, not a forecast"
        >
          <div className="rs-value-orbits" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <svg
            className="rs-value-connectors"
            viewBox="0 0 700 500"
            aria-hidden="true"
          >
            <path
              d="M350 250 150 95M350 250 550 95M350 250 150 405M350 250 550 405"
              stroke="#69c4af"
              strokeWidth="1"
              fill="none"
              opacity=".4"
            />
          </svg>
          <div className="rs-value-core">
            <strong>$28K</strong>
            <span>
              Estimated opportunity
              <br />
              per location
            </span>
          </div>
          <div className="rs-value-label rs-value-revenue">
            <strong>+12%</strong>
            <span>Revenue opportunity</span>
          </div>
          <div className="rs-value-label rs-value-procurement">
            <strong>$18K</strong>
            <span>Procurement savings</span>
          </div>
          <div className="rs-value-label rs-value-labor">
            <strong>+3–6%</strong>
            <span>Labor efficiency</span>
          </div>
          <div className="rs-value-label rs-value-revpash">
            <strong>+0.4</strong>
            <span>RevPASH improvement</span>
          </div>
          <p className="rs-value-disclaimer">
            Illustrative opportunity model. Not a forecast or verified result.
          </p>
        </div>
      </div>
      <dialog ref={dialog} className="rs-calculator">
        <form method="dialog">
          <button
            className="rs-dialog-close"
            aria-label="Close value calculator"
          >
            ×
          </button>
        </form>
        <p className="rs-eyebrow">YOUR VALUE MAP</p>
        <h2>Explore an operating scenario.</h2>
        <p className="rs-calculator-intro">
          Use your monthly figures and choose an assumption to explore. This is
          a simple planning model, not a RADR assessment.
        </p>
        <div className="rs-calculator-fields">
          {[
            { label: "Monthly revenue ($)", value: revenue, set: setRevenue },
            {
              label: "Monthly procurement spend ($)",
              value: procurement,
              set: setProcurement,
            },
            { label: "Monthly labor spend ($)", value: labor, set: setLabor },
          ].map((field) => (
            <label key={field.label}>
              {field.label}
              <input
                type="number"
                min="0"
                max="1000000000"
                step="1000"
                value={field.value}
                onChange={(event) =>
                  field.set(
                    Math.min(
                      1000000000,
                      Math.max(0, Number(event.target.value)),
                    ),
                  )
                }
              />
            </label>
          ))}
          <label>
            Assumed improvement: {improvement}%
            <input
              type="range"
              min="0"
              max="10"
              step=".5"
              value={improvement}
              onChange={(event) => setImprovement(Number(event.target.value))}
            />
          </label>
        </div>
        <div className="rs-calculator-result" aria-live="polite">
          <span>Illustrative monthly opportunity</span>
          <strong>{format(estimate)}</strong>
          <small>
            Revenue × {improvement}% + procurement × {improvement}% + labor ×{" "}
            {improvement}%
          </small>
        </div>
        <p className="rs-calculator-note">
          These categories may overlap. Figures are hypothetical, are not
          additive guarantees, and require validation against your operating
          data. Nothing is sent or saved.
        </p>
        <Link
          href="/contact"
          className="rh-button"
          onClick={() => dialog.current?.close()}
        >
          Discuss my operation <Icon name="arrow" size={18} />
        </Link>
      </dialog>
    </section>
  );
}

export function ReferenceFinal() {
  return (
    <section className="rs-final" aria-labelledby="final-title">
      <div className="rs-final-scene" />
      <div className="rs-container">
        <div className="rs-final-copy">
          <p className="rs-eyebrow">
            YOUR NEXT DECISION STARTS HERE
          </p>
          <h2 id="final-title">
            <span>
              See{" "}
              <Image
                src="/brand/radr-wordmark-balanced-white.svg"
                width={270}
                height={62}
                alt="RADR"
              />
            </span>
            in action<span className="rs-final-period">.</span>
          </h2>
          <p>
            See the signals, decisions and value behind your operation. A walkthrough tailored
            <br className="rs-desktop-break" /> to your systems, priorities and
            opportunities.
          </p>
          <div className="rs-final-buttons">
            <Link href="/contact" className="rh-button">
              Book a demo <Icon name="arrow" size={19} />
            </Link>
            <Link href="/how" className="rh-button rh-button-ghost">
              Explore the platform <Icon name="arrow" size={19} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
