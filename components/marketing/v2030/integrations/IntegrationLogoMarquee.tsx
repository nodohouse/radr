"use client";

/**
 * Two opposite CSS logo rails → RADR node.
 * Representative systems only. Pause on hover. Reduced motion = static grid.
 */

import { useMemo, useState } from "react";
import { usePrefersReducedMotion } from "@/components/marketing/motion/usePrefersReducedMotion";
import {
  marqueeRow,
  type MarqueeItem,
} from "@/lib/marketing/integrationMarquee";
import { IntegrationLogo } from "@/components/marketing/v2030/integrations/IntegrationLogo";
import { IntegrationRadrNode } from "@/components/marketing/v2030/integrations/IntegrationRadrNode";

function Rail({
  items,
  reverse,
  activeId,
  onActivate,
}: {
  items: MarqueeItem[];
  reverse?: boolean;
  activeId: string | null;
  onActivate: (id: string | null) => void;
}) {
  const loop = useMemo(() => [...items, ...items], [items]);

  return (
    <div
      className="rx30-imarquee-rail"
      data-reverse={reverse ? "true" : undefined}
    >
      <div className="rx30-imarquee-track">
        {loop.map((item, i) => (
          <IntegrationLogo
            key={`${item.id}-${i}`}
            item={item}
            active={activeId === item.id}
            onActivate={onActivate}
          />
        ))}
      </div>
    </div>
  );
}

function HoverCard({ item }: { item: MarqueeItem }) {
  return (
    <aside className="rx30-imarquee-card" aria-live="polite">
      <strong>{item.name}</strong>
      <em>{item.category}</em>
      <p>Potential RADR evidence</p>
      <ul>
        {item.dataUnlocked.map((d) => (
          <li key={d}>{d}</li>
        ))}
      </ul>
      <span className="rx30-imarquee-status">Representative · availability varies</span>
    </aside>
  );
}

type Props = {
  /** Show center RADR convergence node + signal dots */
  converge?: boolean;
};

export function IntegrationLogoMarquee({ converge = true }: Props) {
  const reduced = usePrefersReducedMotion();
  const row1 = useMemo(() => marqueeRow(1), []);
  const row2 = useMemo(() => marqueeRow(2), []);
  const [activeId, setActiveId] = useState<string | null>(null);
  const active =
    [...row1, ...row2].find((i) => i.id === activeId) ?? null;

  if (reduced) {
    return (
      <div className="rx30-imarquee rx30-imarquee--static">
        <div className="rx30-imarquee-grid">
          {[...row1, ...row2].map((item) => (
            <IntegrationLogo
              key={item.id}
              item={item}
              active={activeId === item.id}
              onActivate={setActiveId}
            />
          ))}
        </div>
        {active ? <HoverCard item={active} /> : null}
        {converge ? (
          <p className="rx30-imarquee-flow" aria-hidden="true">
            Your systems → RADR → Decisions
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className="rx30-imarquee"
      data-converge={converge ? "true" : undefined}
      onMouseLeave={() => setActiveId(null)}
    >
      <div className="rx30-imarquee-stage">
        <div className="rx30-imarquee-rails">
          <Rail
            items={row1}
            activeId={activeId}
            onActivate={setActiveId}
          />
          <Rail
            items={row2}
            reverse
            activeId={activeId}
            onActivate={setActiveId}
          />
        </div>

        {converge ? (
          <div className="rx30-imarquee-core" aria-hidden="true">
            <div className="rx30-imarquee-paths">
              <span className="rx30-imarquee-dot" style={{ ["--d" as string]: 0 }} />
              <span className="rx30-imarquee-dot" style={{ ["--d" as string]: 1 }} />
              <span className="rx30-imarquee-dot" style={{ ["--d" as string]: 2 }} />
            </div>
            <IntegrationRadrNode />
          </div>
        ) : null}
      </div>

      {active ? <HoverCard item={active} /> : null}
    </div>
  );
}
