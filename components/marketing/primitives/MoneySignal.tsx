import type { DemoSignal } from "../data/demo";

type Props = {
  signal: DemoSignal;
  active?: boolean;
  className?: string;
};

/** Always shows: channel · △ amount · period · title · tag */
export function MoneySignal({
  signal,
  active = true,
  className = "",
}: Props) {
  return (
    <article
      className={`rx-money-signal ${className}`.trim()}
      data-active={active ? "true" : "false"}
    >
      <span className="rx-money-signal-idx">{signal.id}</span>
      <div className="rx-money-signal-body">
        <p className="rx-money-signal-channel">{signal.channelLabel}</p>
        <p className="rx-money-signal-amt">
          <span className="rx-tri">△</span> {signal.amount}
          {signal.period ? (
            <span className="rx-money-signal-period">{signal.period}</span>
          ) : null}
        </p>
        <p className="rx-money-signal-title">{signal.title}</p>
        <p className="rx-money-signal-tag">{signal.tag}</p>
      </div>
    </article>
  );
}
