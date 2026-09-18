type Props = {
  title: string;
  sub?: string;
  children?: React.ReactNode;
};

/** Light product page header - title + one supporting line. */
export function PageHeader({ title, sub, children }: Props) {
  return (
    <header className="rp-page-head">
      <div className="rp-page-head-copy">
        <h1 className="rp-page-title">{title}</h1>
        {sub ? <p className="rp-page-sub">{sub}</p> : null}
      </div>
      {children ? <div className="rp-page-head-actions">{children}</div> : null}
    </header>
  );
}
