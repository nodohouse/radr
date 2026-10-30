"use client";

/**
 * HumanHandoff — Review Now on Control Center.
 * Editorial briefing layout (default on CC) · stack elsewhere.
 */

import Link from "next/link";
import Image from "next/image";
import { useSyncExternalStore } from "react";
import {
  approvalAuthorityFor,
  autonomyLabel,
  readDemoSettings,
  subscribeDemoSettings,
  type DemoSettingsState,
} from "@/lib/radr/product/demoSettings";

export type HandoffItem = {
  id: string;
  displayId: string;
  verb: string;
  where: string;
  economic: string;
  economicEuro?: number;
  deadline?: string | null;
  causal?: string | null;
  whyNow?: string | null;
  href?: string;
  onOpen?: () => void;
  secondary?: boolean;
  imageSrc?: string | null;
  stateLabel?: string | null;
};

function useDemoSettingsLive() {
  return useSyncExternalStore(
    subscribeDemoSettings,
    readDemoSettings,
    readDemoSettings,
  );
}

function parseEuro(formatted: string): number {
  const n = Number(formatted.replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? Math.abs(n) : 0;
}

function padCount(n: number): string {
  return String(Math.max(0, n)).padStart(2, "0");
}

export function HumanHandoff({
  count,
  items,
  ledgerHref = "/app/decisions?band=needs_you&stay=1",
  className = "",
  layout = "stack",
  showPolicy = true,
}: {
  count: number;
  items: HandoffItem[];
  ledgerHref?: string;
  className?: string;
  layout?: "stack" | "compact" | "editorial";
  showPolicy?: boolean;
}) {
  const settings = useDemoSettingsLive();
  const empty = count === 0 || items.length === 0;
  const primary = items[0];
  const rest = items.slice(1);
  const hiddenMore = Math.max(0, count - items.length);
  const editorial = layout === "editorial";
  const compact = layout === "compact";

  return (
    <aside
      className={`rp-handoff ${className}`.trim()}
      data-empty={empty ? "true" : undefined}
      data-layout={editorial ? "editorial" : compact ? "compact" : undefined}
      data-autonomy={settings.autonomyScheduling}
      aria-label="Needs your judgment"
    >
      <header className="rp-handoff-head">
        {editorial ? (
          <>
            <div className="rp-handoff-count" aria-hidden="true">
              <strong>
                <span className="rp-ns-horizon" data-horizon="now">
                  NOW
                </span>{" "}
                · REVIEW
              </strong>
              <span>{empty ? "00" : padCount(count)}</span>
            </div>
            <Link href={ledgerHref} className="rp-handoff-all">
              View all decisions →
            </Link>
          </>
        ) : (
          <>
            <Link href={ledgerHref} className="rp-handoff-count">
              <strong>REVIEW NOW</strong>
              <span>
                {empty
                  ? "Nothing waiting"
                  : `${count} Decision${count === 1 ? "" : "s"}`}
              </span>
            </Link>
            {showPolicy ? (
              <p className="rp-handoff-policy" data-policy="true">
                Policy · {autonomyLabel(settings)} · GM ≤ €
                {settings.approvalGmMax}
              </p>
            ) : null}
          </>
        )}
      </header>

      {empty ? (
        <p className="rp-handoff-quiet">Everything within range.</p>
      ) : editorial ? (
        <ul className="rp-handoff-editorial">
          {items.slice(0, 3).map((item) => (
            <li key={item.id}>
              <HandoffEditorial item={item} />
            </li>
          ))}
        </ul>
      ) : compact ? (
        <div className="rp-handoff-grid">
          {items.slice(0, 3).map((item) => (
            <HandoffCompact key={item.id} item={item} />
          ))}
          {hiddenMore > 0 ? (
            <Link href={ledgerHref} className="rp-handoff-more">
              + {hiddenMore} more →
            </Link>
          ) : null}
        </div>
      ) : (
        <div className="rp-handoff-stack">
          {primary ? <HandoffPrimary item={primary} settings={settings} /> : null}
          {rest.map((item) => (
            <HandoffSecondary key={item.id} item={item} />
          ))}
          {hiddenMore > 0 ? (
            <Link href={ledgerHref} className="rp-handoff-more">
              + {hiddenMore} more signal{hiddenMore === 1 ? "" : "s"} →
            </Link>
          ) : null}
        </div>
      )}

      {!editorial ? (
        !empty ? (
          <Link href={ledgerHref} className="rp-handoff-master">
            {`Review ${count} Decision${count === 1 ? "" : "s"} →`}
          </Link>
        ) : (
          <Link
            href="/app/decisions?band=needs_you&stay=1"
            className="rp-handoff-master"
            data-quiet="true"
          >
            Open Decision Ledger →
          </Link>
        )
      ) : null}
    </aside>
  );
}

function compactApprovalLabel(level: "gm" | "gm_cfo" | "executive"): string {
  if (level === "gm") return "GM approval";
  if (level === "gm_cfo") return "GM + CFO approval";
  return "Executive approval";
}

function HandoffEditorial({ item }: { item: HandoffItem }) {
  const settings = useDemoSettingsLive();
  const euro = item.economicEuro ?? parseEuro(item.economic);
  const authority = approvalAuthorityFor(euro, settings);
  const state = item.stateLabel ?? compactApprovalLabel(authority.level);
  const metaBits = [
    item.deadline ?? "NOW",
    item.where || null,
    state,
  ].filter(Boolean);
  const body = (
    <>
      {item.imageSrc ? (
        <span className="rp-handoff-ed-img">
          <Image src={item.imageSrc} alt="" width={44} height={44} />
        </span>
      ) : (
        <span className="rp-handoff-ed-img" data-empty="true" />
      )}
      <div className="rp-handoff-ed-main">
        <p className="rp-handoff-ed-titleline">
          <span className="rp-handoff-ed-id">{item.displayId}</span>
          <span className="rp-handoff-ed-title">{item.verb}</span>
        </p>
        {item.causal ? (
          <p className="rp-handoff-ed-sub">{item.causal}</p>
        ) : null}
        <p className="rp-handoff-ed-meta">{metaBits.join(" · ")}</p>
      </div>
      <strong className="rp-handoff-ed-econ">
        +{item.economic.replace(/^\+/, "")}
      </strong>
      <span className="rp-handoff-ed-chev" aria-hidden="true">
        →
      </span>
    </>
  );
  if (item.onOpen) {
    return (
      <button type="button" className="rp-handoff-ed-row" onClick={item.onOpen}>
        {body}
      </button>
    );
  }
  return (
    <Link
      href={item.href ?? `/app/decisions/${item.id}`}
      className="rp-handoff-ed-row"
    >
      {body}
    </Link>
  );
}

function HandoffCompact({ item }: { item: HandoffItem }) {
  const body = (
    <>
      <span className="rp-handoff-id">{item.displayId}</span>
      <p className="rp-handoff-verb-sm">{item.verb}</p>
      <strong className="rp-handoff-econ-sm">
        +{item.economic.replace(/^\+/, "")}
      </strong>
      {item.where || item.deadline ? (
        <span className="rp-handoff-compact-meta">
          {[item.where, item.deadline].filter(Boolean).join(" · ")}
        </span>
      ) : null}
    </>
  );
  if (item.onOpen) {
    return (
      <button
        type="button"
        className="rp-handoff-compact"
        onClick={item.onOpen}
      >
        {body}
      </button>
    );
  }
  return (
    <Link
      href={item.href ?? `/app/decisions/${item.id}`}
      className="rp-handoff-compact"
    >
      {body}
    </Link>
  );
}

function HandoffPrimary({
  item,
  settings,
}: {
  item: HandoffItem;
  settings: DemoSettingsState;
}) {
  const euro = item.economicEuro ?? parseEuro(item.economic);
  const authority = approvalAuthorityFor(euro, settings);
  const body = (
    <>
      <p className="rp-handoff-verb" data-handoff-verb="true">
        {item.verb.toUpperCase()}
      </p>
      <div className="rp-handoff-econ">
        <strong>+{item.economic.replace(/^\+/, "")}</strong>
        <span>protected contribution</span>
      </div>
      {item.causal ? <p className="rp-handoff-causal">{item.causal}</p> : null}
      <div className="rp-handoff-meta-row">
        <span className="rp-handoff-where">{item.where}</span>
        <span className="rp-handoff-id">{item.displayId}</span>
        {item.deadline ? (
          <span className="rp-handoff-deadline">{item.deadline}</span>
        ) : null}
      </div>
      <p className="rp-handoff-authority" data-level={authority.level}>
        {authority.label}
      </p>
      <span className="rp-handoff-cta">Inspect →</span>
    </>
  );

  if (item.onOpen) {
    return (
      <button
        type="button"
        className="rp-handoff-card"
        data-primary="true"
        onClick={item.onOpen}
      >
        {body}
      </button>
    );
  }
  return (
    <Link
      href={item.href ?? `/app/decisions/${item.id}`}
      className="rp-handoff-card"
      data-primary="true"
    >
      {body}
    </Link>
  );
}

function HandoffSecondary({ item }: { item: HandoffItem }) {
  const body = (
    <>
      <span className="rp-handoff-id">{item.displayId}</span>
      <p className="rp-handoff-verb-sm">{item.verb}</p>
      <strong className="rp-handoff-econ-sm">
        +{item.economic.replace(/^\+/, "")}
      </strong>
    </>
  );
  if (item.onOpen) {
    return (
      <button type="button" className="rp-handoff-card-sm" onClick={item.onOpen}>
        {body}
      </button>
    );
  }
  return (
    <Link
      href={item.href ?? `/app/decisions/${item.id}`}
      className="rp-handoff-card-sm"
    >
      {body}
    </Link>
  );
}
