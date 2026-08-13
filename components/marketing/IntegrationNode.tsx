type Props = {
  children: React.ReactNode;
};

export function IntegrationNode({ children }: Props) {
  return <span className="radr-system-node">{children}</span>;
}
