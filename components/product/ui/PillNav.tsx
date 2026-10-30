"use client";

/**
 * Local perspective pills — never global navigation.
 */

type Pill = {
  id: string;
  label: string;
};

type Props = {
  items: Pill[];
  value: string;
  onChange: (id: string) => void;
  ariaLabel: string;
  className?: string;
};

export function PillNav({
  items,
  value,
  onChange,
  ariaLabel,
  className,
}: Props) {
  return (
    <div
      className={`rp-pills${className ? ` ${className}` : ""}`}
      role="tablist"
      aria-label={ariaLabel}
    >
      {items.map((item) => {
        const on = item.id === value;
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={on}
            className="rp-pill"
            data-on={on ? "true" : undefined}
            onClick={() => onChange(item.id)}
            onKeyDown={(e) => {
              if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
              e.preventDefault();
              const i = items.findIndex((x) => x.id === item.id);
              const next =
                e.key === "ArrowRight"
                  ? items[(i + 1) % items.length]
                  : items[(i - 1 + items.length) % items.length];
              if (next) onChange(next.id);
            }}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
