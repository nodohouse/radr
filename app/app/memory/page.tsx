"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import {
  subscribeDecisionStore,
  getDecisionStoreSnapshot,
  getDecisionRecord,
} from "@/lib/radr/decision/store";
import { MemoryService } from "@/lib/radr/product/services";
import { displayDecisionId, DECISION_IDS } from "@/lib/radr/decision/ids";
import { useProduct } from "@/lib/product/store";
import { roleContextFor } from "@/lib/radr/product/personas";
import { DEMO_LOCATIONS } from "@/lib/radr/product/demoOrg";
import { OperatingScene } from "@/components/product/visual/OperatingScene";
import { sceneForLocation } from "@/data/demo/visualAssets";

export default function MemoryPage() {
  useSyncExternalStore(
    subscribeDecisionStore,
    getDecisionStoreSnapshot,
    getDecisionStoreSnapshot,
  );
  const { roleView } = useProduct();
  const ctx = roleContextFor(roleView);
  const learnings = MemoryService.forRole(roleView).filter((r) => r.lesson);
  const groupPlaybook =
    ctx.includeGroup ? getDecisionRecord(DECISION_IDS.playbook) : undefined;

  const dna = (() => {
    if (ctx.scopeType === "LOCATION") {
      if (ctx.defaultLocationId === DEMO_LOCATIONS.berlin.id) {
        return [
          {
            id: DEMO_LOCATIONS.berlin.id,
            name: "Berlin Mitte",
            detail:
              "Friday dinner throughput becomes fragile beyond ~94% kitchen load · 12 comparable services",
          },
        ];
      }
      if (ctx.defaultLocationId === DEMO_LOCATIONS.canal.id) {
        return [
          {
            id: DEMO_LOCATIONS.canal.id,
            name: "Canal House · Amsterdam",
            detail: "OTA release discipline · protected inventory",
          },
        ];
      }
      if (ctx.defaultLocationId === DEMO_LOCATIONS.chiado.id) {
        return [
          {
            id: DEMO_LOCATIONS.chiado.id,
            name: "Chiado Collective · Lisbon",
            detail: "Orphan-night net contribution gate",
          },
        ];
      }
    }
    return [
      {
        id: DEMO_LOCATIONS.berlin.id,
        name: "Berlin Mitte",
        detail: "Peak kitchen fragility · wait-12 playbook",
      },
      {
        id: DEMO_LOCATIONS.canal.id,
        name: "Canal House · Amsterdam",
        detail: "OTA release discipline · protected inventory",
      },
      {
        id: DEMO_LOCATIONS.chiado.id,
        name: "Chiado Collective · Lisbon",
        detail: "Orphan-night net contribution gate",
      },
    ];
  })();

  return (
    <div className="rp-memory rp-memory-elevated">
      <header className="rp-ledger-head">
        <p className="rp-cc-kicker">Memory</p>
        <h1 className="rp-cc-title">Operating Memory</h1>
        <p className="rp-cc-since">
          Lessons, patterns and playbooks · {ctx.shortLabel}
        </p>
      </header>

      <section className="rp-drec-sec">
        <h2>Recent learnings</h2>
        {learnings.length === 0 ? (
          <p className="rp-drec-quiet">No learned Decisions in scope yet.</p>
        ) : (
          <ul className="rp-memory-list">
            {learnings.map((r) => (
              <li key={r.id}>
                <Link href={`/app/decisions/${r.id}`}>
                  <span className="rp-cc-id">{displayDecisionId(r.id)}</span>
                  <strong>{r.property}</strong>
                  <p>{r.lesson}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {ctx.allowedLocationIds.includes(DEMO_LOCATIONS.berlin.id) ? (
        <section className="rp-memory-accum" aria-label="Memory accumulation">
          <p className="rp-cc-section-label">Friday peak capacity</p>
          <ol className="rp-memory-ghosts">
            <li>12 comparable services</li>
            <li>5 similar patterns</li>
            <li>4 interventions</li>
            <li>3 verified improvements</li>
            <li data-now="true">Playbook v3 · peak hold + mix</li>
          </ol>
          <Link
            href="/app/intelligence/menu"
            className="rp-drec-secondary"
          >
            Menu intelligence
          </Link>
        </section>
      ) : null}

      {groupPlaybook ? (
        <section className="rp-drec-sec rp-memory-transfer">
          <h2>Group transfer</h2>
          <p>
            {displayDecisionId(groupPlaybook.id)} — similar commercial
            performance, different profit. Test playbook before copying.
          </p>
          <p className="rp-drec-quiet">
            Never auto-copy. Operator confirms transfer.
          </p>
          <Link
            href={`/app/decisions/${groupPlaybook.id}`}
            className="rp-drec-secondary"
          >
            Review {displayDecisionId(groupPlaybook.id)}
          </Link>
        </section>
      ) : null}

      <section className="rp-drec-sec">
        <h2>Operating DNA</h2>
        <ul className="rp-memory-dna-grid">
          {dna.map((d) => {
            const scene = sceneForLocation(d.id);
            return (
              <li key={d.name} className="rp-memory-dna-card">
                {scene ? (
                  <OperatingScene asset={scene} aspect="3/2" />
                ) : null}
                <strong>{d.name}</strong>
                <span>{d.detail}</span>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
