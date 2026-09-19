import { RadrWordmark } from "@/components/marketing/RadrWordmark";

const SIZES = [24, 32, 48, 72, 120, 180] as const;

/** Temporary optical QA: wordmark only on black. */
export default function WordmarkTestPage() {
  return (
    <main
      style={{
        minHeight: "100dvh",
        background: "#050705",
        color: "#F5F2EB",
        padding: "3rem 1.5rem 4rem",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <p
        style={{
          margin: "0 0 2rem",
          fontSize: 11,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          opacity: 0.45,
        }}
      >
        Wordmark optical test · delete when approved
      </p>
      <div
        style={{
          display: "grid",
          gap: "2.5rem",
          justifyItems: "start",
        }}
      >
        {SIZES.map((px) => (
          <div key={px}>
            <p
              style={{
                margin: "0 0 0.65rem",
                fontSize: 11,
                opacity: 0.35,
                fontFamily: "ui-monospace, monospace",
              }}
            >
              {px}px
            </p>
            <div style={{ fontSize: px, lineHeight: 1 }}>
              <RadrWordmark size="md" variant="luminous" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
