type Props = {
  children: React.ReactNode;
  className?: string;
};

export function SectionLabel({ children, className = "radr-kicker" }: Props) {
  return <p className={className}>{children}</p>;
}
