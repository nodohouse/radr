type Props = {
  value: string;
  label: string;
};

export function Metric({ value, label }: Props) {
  return (
    <div className="radr-proof-item">
      <p className="num">{value}</p>
      <p className="cap">{label}</p>
    </div>
  );
}
