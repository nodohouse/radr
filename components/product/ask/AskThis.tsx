"use client";

import { useAskRadrOptional } from "./AskRadrContext";

type Props = {
  query: string;
  label?: string;
  entityId?: string;
  entityLabel?: string;
  className?: string;
};

/**
 * Embedded "Ask this" entry point. Opens Ask RADR with context attached.
 */
export function AskThis({
  query,
  label = "Ask why",
  entityId,
  entityLabel,
  className,
}: Props) {
  const ask = useAskRadrOptional();
  if (!ask) return null;

  return (
    <button
      type="button"
      className={`rp-ask-this ${className ?? ""}`.trim()}
      onClick={() =>
        ask.openAsk({
          query,
          entityId,
          entityLabel,
          autoAsk: true,
        })
      }
    >
      {label}
    </button>
  );
}
