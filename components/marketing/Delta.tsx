import { DeltaOutline } from "./DeltaOutline";

type Props = {
  value: string;
  tone?: "signal" | "ink" | "bone";
  className?: string;
  "data-on"?: string;
};

export function Delta({
  value,
  tone = "signal",
  className = "",
  "data-on": dataOn,
}: Props) {
  return (
    <span
      className={`radr-delta ${className}`.trim()}
      data-tone={tone === "signal" ? undefined : tone}
      data-on={dataOn}
    >
      <DeltaOutline className="radr-delta-mark" tone={tone === "ink" ? "ink" : "signal"} />
      <span className="radr-delta-value radr-money">{value}</span>
    </span>
  );
}
