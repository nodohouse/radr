type Props = {
  className?: string;
  variant?: "edge" | "field" | "footer";
};

/** Static atmospheric field: no continuous transform animation. */
export function GradientFlow({ className = "", variant = "field" }: Props) {
  return (
    <div
      className={`rx-gradflow rx-gradflow--${variant} ${className}`.trim()}
      aria-hidden="true"
      data-static="true"
    />
  );
}
