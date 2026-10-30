"use client";

import Link from "next/link";
import { VendorLogo } from "@/components/product/connections/VendorLogo";
import {
  dependentDecisionsFor,
  type ConnectionDetail,
} from "@/lib/radr/product/connectionsProofEngine";

type Props = {
  detail: ConnectionDetail;
  onClose: () => void;
};

export function ConnectionsDrawer({ detail, onClose }: Props) {
  const { row } = detail;
  const deps = dependentDecisionsFor(row.id);

  return (
    <aside
      className="ce-drawer"
      data-connections-drawer="true"
      aria-label={`${row.name} connection detail`}
    >
      <div className="ce-drawer-head">
        <div className="ce-drawer-sys">
          <VendorLogo id={row.id} name={row.name} size={40} />
          <div>
            <p className="ce-k">{row.category}</p>
            <h3>{row.name}</h3>
            <span
              className="ce-status"
              data-status={row.status.toLowerCase()}
            >
              <i />
              {row.status}
            </span>
          </div>
        </div>
        <button type="button" className="ce-link" onClick={onClose}>
          Close
        </button>
      </div>

      <dl className="ce-drawer-kpis">
        <div>
          <dt>Freshness</dt>
          <dd>{row.freshness}</dd>
        </div>
        <div>
          <dt>Last success</dt>
          <dd>{row.lastSuccessAt}</dd>
        </div>
        <div>
          <dt>Expected cadence</dt>
          <dd>{row.expectedCadence}</dd>
        </div>
        <div>
          <dt>Coverage</dt>
          <dd>
            {row.coverageLabel}
            <em>{row.coverageDetail}</em>
          </dd>
        </div>
      </dl>

      {detail.confidenceImpacts.length > 0 ? (
        <section className="ce-drawer-block">
          <h4>Decision confidence impact</h4>
          <ul className="ce-conf-list">
            {detail.confidenceImpacts.map((c) => (
              <li key={c.decisionId}>
                <Link href={`/app/decisions/${c.decisionId}`}>{c.label}</Link>
                <strong>
                  {c.from}% → {c.to}%
                </strong>
                <span>{c.reason}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {detail.affectedCapabilities.length > 0 ? (
        <section className="ce-drawer-block">
          <h4>What becomes uncertain</h4>
          <ul className="ce-bullet">
            {detail.affectedCapabilities.map((a) => (
              <li key={a}>{a}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="ce-drawer-block">
        <h4>Data objects</h4>
        <ul className="ce-obj-list">
          {detail.objects.map((o) => (
            <li key={o.id}>
              <span>{o.name}</span>
              <em data-state={o.state.toLowerCase()}>{o.state}</em>
            </li>
          ))}
        </ul>
      </section>

      <section className="ce-drawer-block">
        <h4>Location coverage</h4>
        <ul className="ce-obj-list">
          {detail.locations.map((l) => (
            <li key={l.id}>
              <span>{l.name}</span>
              <em data-state={l.state.toLowerCase().replace(/\s+/g, "-")}>
                {l.state}
              </em>
            </li>
          ))}
        </ul>
      </section>

      <section className="ce-drawer-block">
        <h4>Permission scope</h4>
        <p className="ce-perm">
          <strong>Read:</strong> {detail.permissionScope.read.join(" · ")}
        </p>
        <p className="ce-perm">
          <strong>Write:</strong> {detail.permissionScope.write.join(" · ")}
        </p>
      </section>

      {deps.length > 0 ? (
        <section className="ce-drawer-block">
          <h4>Decision dependency</h4>
          <div className="ce-deps">
            {deps.map((d) => (
              <Link key={d.id} href={`/app/decisions/${d.id}`}>
                {d.label}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="ce-drawer-block ce-drawer-meta">
        <p>
          Connected by {detail.connectedBy} · {detail.connectedAt}
        </p>
        <p>Last changed {detail.lastChanged}</p>
      </section>

      <div className="ce-drawer-links">
        <Link href={detail.dataHealthHref}>View Data Health →</Link>
        {deps[0] ? (
          <Link href={`/app/decisions/${deps[0].id}`}>Open Decision →</Link>
        ) : null}
      </div>
    </aside>
  );
}
