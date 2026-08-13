type Props = {
  title: string;
  body: string;
  action?: React.ReactNode;
};

export function EmptyState({ title, body, action }: Props) {
  return (
    <div className="prep-empty prep-card">
      <p className="text-xl font-semibold tracking-tight">{title}</p>
      <p className="mt-2 max-w-md text-[var(--ink-muted)]">{body}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
