const topics: Record<string, { label: string; words: string[]; kind: string }> =
  {
    "the-hidden-cost-of-your-bestseller": {
      label: "WHEN DEMAND MEETS CAPACITY",
      words: ["BUY", "LABOR", "SELL"],
      kind: "capacity",
    },
    "a-full-hotel-can-still-have-a-margin-problem": {
      label: "THE ECONOMICS BEHIND THE STAY",
      words: ["DEMAND", "READINESS", "CONTRIBUTION"],
      kind: "hotel",
    },
    "the-forecast-gap-needs-a-decision": {
      label: "FROM VARIANCE TO A DECISION",
      words: ["BASELINE", "DRIVERS", "NEXT MOVE"],
      kind: "forecast",
    },
    "a-supplier-credit-is-not-recovered-money": {
      label: "FOLLOW THE EVIDENCE",
      words: ["CLAIM", "CREDIT", "RECONCILE"],
      kind: "recovery",
    },
  };
export function EditorialArtwork({ slug }: { slug: string }) {
  const topic = topics[slug] || topics["the-hidden-cost-of-your-bestseller"];
  return (
    <div
      className={`rr-article-art rr-article-art--${topic.kind}`}
      role="img"
      aria-label={`Concept illustration: ${topic.label.toLowerCase()}. Not live operating data.`}
    >
      <span>{topic.label}</span>
      <svg viewBox="0 0 600 180" aria-hidden="true">
        <defs>
          <linearGradient id={`art-${topic.kind}`} x2="1" y2="1">
            <stop stopColor="#7ef0ba" />
            <stop offset="1" stopColor="#b7d5ff" />
          </linearGradient>
        </defs>
        {topic.kind === "hotel" ? (
          <g fill="none" stroke="#a8ccdf" strokeWidth="2">
            {[0, 1, 2, 3].map((i) => (
              <g key={i}>
                <path
                  d={`M130 ${35 + i * 30}L300 ${12 + i * 30}L470 ${35 + i * 30}L300 ${60 + i * 30}Z`}
                  fill={i === 2 ? "#7ef0ba22" : "#ffffff08"}
                />
                <path
                  d={`M130 ${35 + i * 30}v20L300 ${80 + i * 30}L470 ${55 + i * 30}v-20`}
                />
              </g>
            ))}
          </g>
        ) : topic.kind === "recovery" ? (
          <g>
            {[0, 1, 2].map((i) => (
              <g key={i}>
                <rect
                  x={60 + i * 180}
                  y="45"
                  width="120"
                  height="90"
                  rx="14"
                  fill="#ffffff12"
                  stroke="#b4d4e4"
                />
                <path
                  d={`M${83 + i * 180} 76h70m-70 17h45m-45 17h58`}
                  stroke={i === 2 ? "#7ef0ba" : "#b4d4e4"}
                  strokeWidth="3"
                />
                {i < 2 ? (
                  <path
                    d={`M${192 + i * 180} 90h30m-8-7 8 7-8 7`}
                    fill="none"
                    stroke="#7ef0ba"
                    strokeWidth="2"
                  />
                ) : null}
              </g>
            ))}
          </g>
        ) : (
          <g fill="none">
            <path d="M30 140H570M30 90H570M30 40H570" stroke="#ffffff18" />
            <path
              d="M30 140C80 140 80 110 130 112S200 145 245 75 320 100 365 48 455 100 495 30 540 50 570 24"
              stroke={`url(#art-${topic.kind})`}
              strokeWidth="4"
            />
            <path
              d={topic.kind === "capacity" ? "M30 90H570" : "M30 140L570 40"}
              stroke="#b4d4e4"
              strokeDasharray="7 7"
              strokeWidth="2"
            />
            {topic.kind === "capacity" ? (
              <rect
                x="260"
                y="20"
                width="180"
                height="140"
                rx="12"
                fill="#7ef0ba10"
                stroke="#7ef0ba55"
              />
            ) : null}
          </g>
        )}
      </svg>
      <div>
        {topic.words.map((word) => (
          <b key={word}>{word}</b>
        ))}
      </div>
      <small>CONCEPT ILLUSTRATION</small>
    </div>
  );
}
