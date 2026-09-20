/**
 * AttentionBrief — “N things need you”.
 */

type Props = {
  count: number;
  quietLine?: string;
  className?: string;
};

export function AttentionBrief({
  count,
  quietLine = "Everything else is within expectations.",
  className = "",
}: Props) {
  const noun = count === 1 ? "thing needs you" : "things need you";
  return (
    <div className={`rx-ab ${className}`.trim()}>
      <p className="rx-ab-need">
        <strong>
          {count} {noun}.
        </strong>
      </p>
      {quietLine ? <p className="rx-ab-quiet">{quietLine}</p> : null}
    </div>
  );
}
