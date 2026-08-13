type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export function PageHeader({ eyebrow, title, description, actions }: Props) {
  return (
    <header className="prep-page-header">
      <div className="min-w-0">
        {eyebrow ? <p className="prep-page-eyebrow">{eyebrow}</p> : null}
        <h1 className="prep-page-title">{title}</h1>
        {description ? (
          <p className="prep-page-desc">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="prep-page-actions">{actions}</div> : null}
    </header>
  );
}
