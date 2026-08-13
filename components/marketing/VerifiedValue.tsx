type Props = {
  value: string;
  label?: string;
  note?: string;
};

export function VerifiedValue({
  value,
  label = "Verified value",
  note,
}: Props) {
  return (
    <div className="radr-compound-total">
      <p className="label">{label}</p>
      <p className="value">{value}</p>
      {note ? <p className="sub">{note}</p> : null}
    </div>
  );
}
