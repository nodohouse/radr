"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Glyph, Sparkline } from "./MockupVisuals";

const OperationContext = createContext<{
  active: number;
  setActive: (n: number) => void;
} | null>(null);
export function OperationProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(0);
  return (
    <OperationContext.Provider value={{ active, setActive }}>
      {children}
    </OperationContext.Provider>
  );
}

const operationData = [
  {
    name: "Restaurants",
    icon: "restaurant",
    sub: "Independent and multi-unit restaurants",
    title: "From daily shifts to bigger opportunities.",
    copy: "Optimize labor, menu performance, guest experience and procurement — all in one place.",
    items: [
      "Control costs and improve margins",
      "Adapt to real-time demand",
      "Deliver better guest experiences",
      "Make faster, more confident decisions",
    ],
  },
  {
    name: "Hotels",
    icon: "hotel",
    sub: "Full-service, lifestyle and resorts",
    title: "A clearer picture of every stay.",
    copy: "Connect rooms, F&B and the teams behind the guest experience. Make the operation visible beyond any single system.",
    items: [
      "Understand room and F&B performance",
      "Review staffing in context",
      "Connect supplier and operating data",
      "Keep the guest experience in view",
    ],
  },
  {
    name: "Multi-site Groups",
    icon: "group",
    sub: "Unify performance across your portfolio",
    title: "Local context. Portfolio perspective.",
    copy: "Bring the differences across locations into focus, while keeping every team connected to the wider picture.",
    items: [
      "Compare operating patterns",
      "Surface cross-location differences",
      "Connect group and local decisions",
      "Learn from resolved issues",
    ],
  },
];
export function OperationSelector({ compact = false }: { compact?: boolean }) {
  const [localActive, setLocalActive] = useState(0);
  const shared = useContext(OperationContext);
  const active = shared?.active ?? localActive;
  const setActive = shared?.setActive ?? setLocalActive;
  const op = operationData[active];
  return (
    <section
      className={compact ? "mx-operation-strip" : "mx-section mx-light"}
      id={compact ? "operation-types" : "tailored"}
    >
      <div className="mx-wrap">
        {compact ? (
          <p className="mx-kicker mx-centered">
            BUILT FOR EVERY HOSPITALITY OPERATION
          </p>
        ) : null}
        <div className={compact ? "mx-operation-buttons" : "mx-tailored-grid"}>
          {!compact && (
            <div>
              <p className="mx-kicker">TAILORED FOR YOUR OPERATION</p>
              <h2>
                Different operations.
                <br />
                Same intelligence layer<span>.</span>
              </h2>
              <p>
                Whether you run a single restaurant, a full-service hotel, or a
                global group, RADR adapts to your operation and helps you focus
                on what drives the most value.
              </p>
            </div>
          )}
          <div>
            <div
              className="mx-operation-options"
              role="group"
              aria-label="Hospitality operation"
            >
              {operationData.map((item, i) => (
                <button
                  key={item.name}
                  aria-pressed={active === i}
                  onClick={() => setActive(i)}
                >
                  <Glyph name={item.icon} />
                  <span>
                    {item.name}
                    {compact && <small>{item.sub}</small>}
                  </span>
                  <b aria-hidden="true">›</b>
                </button>
              ))}
            </div>
            {!compact && (
              <div className="mx-operation-detail">
                <div className="mx-operation-photo">
                  <Image
                    src={
                      active === 0
                        ? "/images/radr-restaurant.webp"
                        : "/images/radr-pavilion-new.webp"
                    }
                    fill
                    sizes="(max-width: 700px) 90vw, 420px"
                    alt={
                      active === 0
                        ? "Warm contemporary restaurant interior"
                        : "Coastal hospitality pavilion at dusk"
                    }
                  />
                </div>
                <div aria-live="polite">
                  <p className="mx-kicker">{op.name.toUpperCase()} SOLUTIONS</p>
                  <h3>{op.title}</h3>
                  <p>{op.copy}</p>
                  <ul>
                    {op.items.map((item) => (
                      <li key={item}>
                        <Glyph name="check" size={15} />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link className="mx-button mx-button-dark" href="/contact">
                    Explore {op.name.toLowerCase()} solutions{" "}
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

const locationRows = [
  {
    name: "Coastal Bistro",
    state: "Healthy",
    revenue: "$12.4K",
    labor: "28%",
    guest: "4.6",
  },
  {
    name: "Harbor Hotel",
    state: "Watch",
    revenue: "$28.1K",
    labor: "32%",
    guest: "4.8",
  },
  {
    name: "Pine & Oak",
    state: "Healthy",
    revenue: "$18.6K",
    labor: "26%",
    guest: "4.4",
  },
  {
    name: "Summit Resort",
    state: "Watch",
    revenue: "$31.2K",
    labor: "33%",
    guest: "4.7",
  },
];
export function OperatingTable() {
  const [filter, setFilter] = useState("All locations");
  return (
    <div className="mx-operating-table">
      <div className="mx-table-heading">
        <span>
          <Glyph name="check" />{" "}
          <strong>
            Operating state
            <small>Illustrative view across your portfolio</small>
          </strong>
        </span>
        <label>
          <span className="sr-only">Filter operating locations</span>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            {["All locations", "Healthy", "Watch"].map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="mx-table-tabs">
        Overview <b>Locations</b> Revenue　 Labor　 Guest Experience　 Supply
      </div>
      <div className="mx-table-scroll">
        <table>
          <thead>
            <tr>
              <th>Location</th>
              <th>Revenue</th>
              <th>Labor</th>
              <th>Guest experience</th>
              <th>Operating state</th>
            </tr>
          </thead>
          <tbody>
            {locationRows
              .filter((r) => filter === "All locations" || r.state === filter)
              .map((row, i) => (
                <tr key={row.name}>
                  <td>
                    <Image
                      src={
                        i % 2
                          ? "/images/radr-pavilion-new.webp"
                          : "/images/radr-restaurant.webp"
                      }
                      width={52}
                      height={35}
                      alt=""
                    />
                    <span>
                      {row.name}
                      <small>Example location</small>
                    </span>
                  </td>
                  <td>
                    {row.revenue}
                    <Sparkline />
                  </td>
                  <td>
                    {row.labor}
                    <Sparkline blue />
                  </td>
                  <td>{row.guest}</td>
                  <td>
                    <i className={row.state === "Watch" ? "watch" : ""} />
                    {row.state}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function InsightPanel() {
  const [active, setActive] = useState(0);
  const data = [
    {
      name: "Insights",
      title: "Menu mix underperforming at dinner service",
      copy: "Dinner check averages are 12% below similar example locations, driven by lower mix of high-margin items.",
    },
    {
      name: "Recommendations",
      title: "Review the dinner menu mix",
      copy: "Compare menu contribution and guest demand before choosing the next action.",
    },
    {
      name: "Actions",
      title: "Prepare a focused menu review",
      copy: "Compile the evidence and assign an owner. Your team reviews and approves the next step.",
    },
    {
      name: "Workflows",
      title: "Track the decision to its outcome",
      copy: "Keep the evidence, owner and follow-up together. Verify the result before calling value realized.",
    },
  ];
  return (
    <div className="mx-insight-visual">
      <div
        className="mx-insight-tabs"
        role="group"
        aria-label="Insight workflow"
      >
        {data.map((d, i) => (
          <button
            key={d.name}
            aria-pressed={i === active}
            onClick={() => setActive(i)}
          >
            <Glyph name={["chart", "spark", "check", "group"][i]} size={18} />
            {d.name}
          </button>
        ))}
      </div>
      <div className="mx-insight-card">
        <div aria-live="polite">
          <p className="mx-kicker">{data[active].name} · EXAMPLE</p>
          <h3>{data[active].title}</h3>
          <p>{data[active].copy}</p>
          <Link className="mx-button" href="/contact">
            View details <span aria-hidden="true">→</span>
          </Link>
        </div>
        <Image
          src="/images/radr-restaurant.webp"
          width={260}
          height={300}
          alt="An evening restaurant setting"
        />
      </div>
    </div>
  );
}
