import "@/components/product/lab/lab.css";
import { LabShell } from "@/components/product/lab/LabShell";

/**
 * Persistent LAB shell — status + Dock survive workspace route changes.
 * Production product chrome remains suppressed via ProductShell isLab.
 */
export default function LabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LabShell>{children}</LabShell>;
}
