import type { Metadata } from "next";
import { Suspense } from "react";
import "../../lab.css";
import { LabProvider } from "@/components/lab/LabProvider";
import { LabShell } from "@/components/lab/LabShell";

export const metadata: Metadata = {
  title: "RADR · Control Center",
  description: "Margin intelligence: product vision prototype (demo data).",
  robots: { index: false, follow: false },
};

function LabFrame({ children }: { children: React.ReactNode }) {
  return (
    <LabProvider>
      <LabShell>{children}</LabShell>
    </LabProvider>
  );
}

export default function LabLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="lab-os" style={{ padding: "2rem" }}>
          Loading Control Center…
        </div>
      }
    >
      <LabFrame>{children}</LabFrame>
    </Suspense>
  );
}
