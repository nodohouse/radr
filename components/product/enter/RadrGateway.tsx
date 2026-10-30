"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { FrozenRadrLogo } from "@/components/brand/FrozenRadrLogo";
import {
  ENTER_MAP_CITIES,
  ENTER_WORLDS,
  type EnterWorld,
} from "@/lib/radr/demo/enterWorlds";
import {
  readDemoOrgSession,
  writeDemoOrgSession,
} from "@/lib/radr/demo/demoOrgSession";
import type { DemoVerticalFamily } from "@/lib/radr/vertical/experienceProfile";
import { GatewayWorldCard } from "@/components/product/enter/GatewayWorldCard";
import {
  BoltIcon,
  DatabaseIcon,
  GlobeIcon,
} from "@/components/product/enter/GatewayIcons";
import "@/components/product/enter/radr-gateway.css";

const WORLDS: EnterWorld[] = [ENTER_WORLDS.restaurant, ENTER_WORLDS.hotel];

function enterWorld(
  vertical: DemoVerticalFamily,
  router: ReturnType<typeof useRouter>,
) {
  writeDemoOrgSession(vertical);
  try {
    sessionStorage.setItem("radr.demoEntered.v1", "1");
    const loc =
      vertical === "hotel" ? "loc_canal_house" : "loc_berlin_mitte";
    localStorage.setItem(
      "radr.prefs.v1",
      JSON.stringify({
        roleView: vertical === "hotel" ? "hotel_gm" : "gm",
        defaultLocationId: loc,
      }),
    );
    sessionStorage.setItem(
      "radr.scope.v1",
      JSON.stringify({ locationScope: loc }),
    );
  } catch {
    /* ignore */
  }
  router.replace("/app?stay=1");
}

function GatewayMap() {
  const pts = ENTER_MAP_CITIES;
  /** Gentle arcs across the upper sky — no zig-zag through the headline. */
  const arcs = [
    [pts[0], pts[1], pts[2]],
    [pts[1], pts[3], pts[4]],
    [pts[2], pts[5], pts[6]],
  ] as const;

  return (
    <div className="rgw-map" aria-hidden>
      <svg className="rgw-map-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
        {arcs.map((trip, i) => {
          const [a, b, c] = trip;
          const d = `M ${a.x} ${a.y} Q ${b.x} ${Math.max(8, b.y - 18)} ${c.x} ${c.y}`;
          return <path key={i} className="rgw-map-arc" d={d} />;
        })}
      </svg>
      {pts.map((p) => (
        <span
          key={p.id}
          className="rgw-map-pin"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
        >
          <i className="rgw-map-dot" />
        </span>
      ))}
    </div>
  );
}

type Props = {
  preselect: DemoVerticalFamily | null;
  autoEnter: boolean;
};

export function RadrGateway({ preselect, autoEnter }: Props) {
  const router = useRouter();
  const titleId = useId();
  const [selected, setSelected] = useState<DemoVerticalFamily | null>(
    preselect,
  );
  const [last, setLast] = useState<DemoVerticalFamily | null>(null);
  const [didAuto, setDidAuto] = useState(false);

  useEffect(() => {
    setLast(readDemoOrgSession().vertical);
  }, []);

  useEffect(() => {
    if (preselect) setSelected(preselect);
  }, [preselect]);

  const handleEnter = useCallback(
    (vertical: DemoVerticalFamily) => {
      enterWorld(vertical, router);
    },
    [router],
  );

  useEffect(() => {
    if (!autoEnter || !preselect || didAuto) return;
    setDidAuto(true);
    handleEnter(preselect);
  }, [autoEnter, preselect, didAuto, handleEnter]);

  return (
    <div className="rgw-root" data-nav-theme="light">
      <div className="rgw-atmosphere" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="rgw-atmosphere-img"
          src="/live/estate/estate-world-base@2x.jpg"
          alt=""
          decoding="async"
        />
        <div className="rgw-atmosphere-wash" />
        <GatewayMap />
      </div>

      <div className="rgw-shell">
        <header className="rgw-top">
          <div className="rgw-brand">
            <span className="rgw-brand-mark">
              <FrozenRadrLogo
                variant="wordmark"
                theme="dark"
                size="md"
                decorative
              />
            </span>
            <p className="rgw-brand-kicker">RADR operating system</p>
          </div>
          <p className="rgw-top-aside">
            Intelligence for a more hospitable world
          </p>
        </header>

        <section className="rgw-hero" aria-labelledby={titleId}>
          <h1 id={titleId}>Choose your operating world</h1>
          <p>
            Two complete fictional hospitality operations. One RADR intelligence
            engine.
          </p>
        </section>

        <ul className="rgw-worlds" role="list">
          {WORLDS.map((world) => (
            <GatewayWorldCard
              key={world.id}
              world={world}
              selected={selected === world.id}
              lastVisited={last === world.id}
              onSelect={() => setSelected(world.id)}
              onEnter={() => handleEnter(world.id)}
            />
          ))}
        </ul>

        <ul className="rgw-trust" role="list">
          <li>
            <span className="rgw-trust-icon">
              <GlobeIcon />
            </span>
            <div>
              <strong>Global by design</strong>
              <span>Multiple markets. One intelligence engine.</span>
            </div>
          </li>
          <li>
            <span className="rgw-trust-icon">
              <DatabaseIcon />
            </span>
            <div>
              <strong>Completely fictional</strong>
              <span>Explore freely. No real data.</span>
            </div>
          </li>
          <li>
            <span className="rgw-trust-icon">
              <BoltIcon />
            </span>
            <div>
              <strong>Switch anytime</strong>
              <span>Move between worlds seamlessly.</span>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}

export { enterWorld };
