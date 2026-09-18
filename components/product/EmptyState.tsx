import Link from "next/link";

type Props = {
  title: string;
  body: string;
  action?: { href: string; label: string };
};

export function EmptyState({ title, body, action }: Props) {
  return (
    <div className="rp-empty" role="status">
      <h3>{title}</h3>
      <p>{body}</p>
      {action ? (
        <p style={{ marginTop: "1rem" }}>
          <Link href={action.href} className="rp-btn rp-btn-primary">
            {action.label}
          </Link>
        </p>
      ) : null}
    </div>
  );
}
