"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DEMO_POLICIES,
  type DemoPolicy,
  type DemoSettingsState,
  type PolicyCategory,
} from "@/lib/radr/product/demoSettings";

type Props = {
  demo: DemoSettingsState;
  focusPolicy: string | null;
  onPatch: (partial: Partial<DemoSettingsState>) => void;
  isHotel: boolean;
};

const CATEGORY_LABEL: Record<PolicyCategory, string> = {
  financial: "Financial",
  operations: "Operations",
  guest: "Guest",
  procurement: "Procurement",
  labor: "Labor",
};

export function SettingsPolicies({
  demo,
  focusPolicy,
  onPatch,
  isHotel,
}: Props) {
  const policies = useMemo(() => {
    const list = demo.policies?.length ? demo.policies : DEMO_POLICIES;
    return list.filter((p) => {
      if (isHotel) return true;
      return (
        p.id !== "housekeeping_reassign" && p.id !== "hotel_channel_hold"
      );
    });
  }, [demo.policies, isHotel]);

  const [selectedId, setSelectedId] = useState(
    focusPolicy && policies.some((p) => p.id === focusPolicy)
      ? focusPolicy
      : policies[0]?.id ?? "",
  );

  useEffect(() => {
    if (focusPolicy && policies.some((p) => p.id === focusPolicy)) {
      setSelectedId(focusPolicy);
      const el = document.querySelector(`[data-policy-card="${focusPolicy}"]`);
      el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [focusPolicy, policies]);

  const selected =
    policies.find((p) => p.id === selectedId) ?? policies[0] ?? null;

  const categories = useMemo(() => {
    const set = new Set(policies.map((p) => p.category));
    return [...set];
  }, [policies]);

  return (
    <div className="se-policies" data-settings-policies="true">
      <section className="se-panel">
        <header className="se-panel-head">
          <div>
            <h2>Policies & Approvals</h2>
            <p>
              Boundaries for money, operations, and guest impact. Policies define
              who approves and what RADR may prepare.
            </p>
          </div>
        </header>

        <div className="se-form" style={{ marginBottom: 16 }}>
          <div className="se-field">
            <label htmlFor="gm-max">GM approval ceiling</label>
            <small>
              Supplier / spend under this amount: GM may approve alone.
            </small>
            <div className="se-field-row">
              <span className="se-suffix">€</span>
              <input
                id="gm-max"
                type="number"
                min={50}
                max={5000}
                step={50}
                value={demo.approvalGmMax}
                data-testid="policy-gm-max"
                onChange={(e) =>
                  onPatch({ approvalGmMax: Number(e.target.value) })
                }
              />
            </div>
          </div>
          <div className="se-field">
            <label>Coverage</label>
            <small>
              {policies.length} active · {categories.length} categories
            </small>
            <input
              readOnly
              value={categories.map((c) => CATEGORY_LABEL[c]).join(" · ")}
            />
          </div>
        </div>

        <div className="se-policy-grid">
          {policies.map((p) => (
            <button
              key={p.id}
              type="button"
              className="se-policy-card"
              data-policy-card={p.id}
              data-active={selected?.id === p.id ? "true" : undefined}
              onClick={() => setSelectedId(p.id)}
            >
              <em>{CATEGORY_LABEL[p.category]}</em>
              <strong>{p.name}</strong>
              <span>{p.scope}</span>
              <p>{p.threshold}</p>
              <footer>
                <span>Owner · {p.owner}</span>
                <span className="se-pill" data-tone="override">
                  {p.status}
                </span>
              </footer>
            </button>
          ))}
        </div>
      </section>

      {selected ? <PolicyDetail policy={selected} /> : null}
    </div>
  );
}

function PolicyDetail({ policy }: { policy: DemoPolicy }) {
  return (
    <aside
      className="se-panel se-detail"
      data-policy-detail={policy.id}
      id={`policy-${policy.id}`}
    >
      <header className="se-panel-head">
        <div>
          <h2>{policy.name}</h2>
          <p>
            {CATEGORY_LABEL[policy.category]} · {policy.scope}
          </p>
        </div>
      </header>

      <dl className="se-dl">
        <div>
          <dt>Current rule</dt>
          <dd>{policy.threshold}</dd>
        </div>
        <div>
          <dt>Approvers</dt>
          <dd>{policy.approvers}</dd>
        </div>
        <div>
          <dt>Owner</dt>
          <dd>{policy.owner}</dd>
        </div>
        <div>
          <dt>Autonomy class</dt>
          <dd>{policy.autonomy}</dd>
        </div>
        <div>
          <dt>Duration</dt>
          <dd>{policy.duration}</dd>
        </div>
        <div>
          <dt>Reversibility</dt>
          <dd>{policy.reversibility}</dd>
        </div>
        {policy.evidence ? (
          <div>
            <dt>Evidence</dt>
            <dd>{policy.evidence}</dd>
          </div>
        ) : null}
        <div>
          <dt>Audit</dt>
          <dd>{policy.audit}</dd>
        </div>
      </dl>
    </aside>
  );
}
