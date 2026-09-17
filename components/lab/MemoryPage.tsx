"use client";

import { formatEuro } from "@/lib/lab/format";
import { MEMORY_CHAIN } from "@/lib/lab/memory";
import { useLab } from "@/lib/lab/store";

export function MemoryPage() {
  const { nav, setMemoryScope, setSeed, goCenter, setCenterView } = useLab();
  const story = MEMORY_CHAIN.find((s) => s.id === nav.memoryScope) ?? MEMORY_CHAIN[0]!;

  return (
    <div className="lab-viewport lab-memory">
      <header className="lab-surf-head">
        <div>
          <p className="lab-k">Memory</p>
          <h1 className="lab-surf-title">Learning stories</h1>
          <p className="lab-surf-sub">What we tried → observed → verified → next time</p>
        </div>
      </header>
      <div className="lab-memory-chain" aria-label="Learning chain">
        {MEMORY_CHAIN.map((step, i) => (
          <button
            key={step.id}
            type="button"
            className="lab-memory-step"
            data-on={nav.memoryScope === step.id || undefined}
            onClick={() => setMemoryScope(step.id)}
          >
            <strong>{step.n}</strong>
            <span>{step.label}</span>
            {i < MEMORY_CHAIN.length - 1 ? <em aria-hidden="true">→</em> : null}
          </button>
        ))}
      </div>
      <article className="lab-memory-story">
        <p className="lab-k">{story.kicker}</p>
        <h2>{story.title}</h2>
        {story.euro != null && story.grade ? (
          <p className="lab-story-euro" data-grade={story.grade}>
            <strong>{formatEuro(story.euro)}</strong>
            <span>{story.grade}</span>
          </p>
        ) : null}
        <ol className="lab-memory-beats">
          <li>
            <em>Tried</em>
            <p>{story.tried}</p>
          </li>
          <li>
            <em>Observed</em>
            <p>{story.observed}</p>
          </li>
          <li>
            <em>Verified</em>
            <p>{story.verified}</p>
          </li>
          <li>
            <em>Next time</em>
            <p>{story.next}</p>
          </li>
        </ol>
      </article>
      <div className="lab-memory-traj">
        <p className="lab-k">Open related Decisions</p>
        <button type="button" className="lab-memory-learn" onClick={() => { setSeed("service"); goCenter("service"); }}>
          <em>D-1911</em>
          <strong>Wait-12 path · Friday capacity</strong>
          <span>because kitchen constraint before seats</span>
        </button>
        <button
          type="button"
          className="lab-memory-learn"
          onClick={() => {
            setCenterView("brief");
            setSeed("service");
            goCenter("service");
          }}
        >
          <em>BRIEF</em>
          <strong>Open FOH / Chef packet</strong>
          <span>because protocol beats dashboard dump</span>
        </button>
        <p className="lab-auto-memory">Seen 12 similar Fridays · auto-stage allowed.</p>
      </div>
    </div>
  );
}
