import Image from "next/image";

export function OperatingCanvas({ variant = "portfolio" }: { variant?: "portfolio" | "people" | "operations" }) {
  const content = variant === "people"
    ? { label: "HUMAN INTELLIGENCE, AMPLIFIED", title: "More clarity. More room for people.", sources: ["Evidence", "Context", "Experience"], outcomes: ["Better decisions", "Accountable teams", "Guest experience"] }
    : variant === "operations"
      ? { label: "ONE OPERATING PICTURE", title: "Every team. Connected.", sources: ["Finance", "Operations", "Commercial"], outcomes: ["Shared context", "Clear ownership", "Visible outcomes"] }
      : { label: "LOCATION → PORTFOLIO", title: "Keep the evidence behind the value.", sources: ["Location 01", "Location 02", "Location 03"], outcomes: ["Compare signals", "Prioritize action", "Verify outcomes"] };
  return <div className={`vc-canvas vc-${variant}`}>
    <div className="vc-canvas-top"><span>{content.label}</span><i aria-hidden="true" /></div>
    <h3>{content.title}</h3>
    <div className="vc-network">
      <div className="vc-lanes">{content.sources.map((s, i) => <span key={s}><b>0{i + 1}</b>{s}</span>)}</div>
      <svg viewBox="0 0 400 170" preserveAspectRatio="none" aria-hidden="true"><path d="M0 25C100 25 100 85 200 85S300 25 400 25M0 85H400M0 145C100 145 100 85 200 85S300 145 400 145" /></svg>
      <div className="vc-canvas-core"><Image src="/brand/radr-mark-clean-white.svg" alt="RADR" width={36} height={36} /><span>Operating<br />intelligence</span></div>
      <div className="vc-lanes vc-results">{content.outcomes.map(s => <span key={s}>{s}<i aria-hidden="true"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M6 18 18 6M6 6h12v12" /></svg></i></span>)}</div>
    </div>
    <div className="vc-canvas-bottom"><span>Signals connected</span><span>People in control</span></div>
  </div>;
}

export function OperationPreview({ hotel = false }: { hotel?: boolean }) {
  return <span className="vc-operation-preview" aria-hidden="true">
    <span className="vc-preview-label">{hotel ? "PROPERTY INTELLIGENCE" : "OPERATING INTELLIGENCE"}</span>
    <span className="vc-preview-chart">{[35, 48, 40, 65, 56, 80, 72, 95].map((h, i) => <i key={i} style={{ height: `${h}%` }} />)}</span>
    <span className="vc-preview-signal"><i />{hotel ? "Demand → rate decisions" : "Cost signals → clearer decisions"}</span>
  </span>;
}
