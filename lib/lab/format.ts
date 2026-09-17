/** Demo money formatting. Never invent Verified amounts — callers supply grade. */

export function formatEuro(amount: number): string {
  const abs = Math.round(Math.abs(amount));
  const body = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (amount < 0) return `−€${body}`;
  return `€${body}`;
}

export function formatEuroCompact(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 1000 && abs % 100 === 0 && abs < 10000) {
    const k = abs / 1000;
    const text = Number.isInteger(k) ? `${k}` : k.toFixed(1);
    return `${amount < 0 ? "−" : ""}€${text}k`;
  }
  return formatEuro(amount);
}

export function minutesToLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function parseHm(label: string): number {
  const [h, m] = label.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}
