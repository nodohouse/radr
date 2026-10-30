"use client";

import { Suspense, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ControlCenter } from "@/components/product/control-center/ControlCenter";
import { readDefaultLanding } from "@/lib/product/dashboards";
import "@/components/product/control-center/control-center.css";

function DefaultLandingGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const search = useSearchParams();
  const redirected = useRef(false);

  useEffect(() => {
    if (redirected.current) return;
    if (search.get("focus") || search.get("view") || search.get("stay") === "1") {
      return;
    }
    const landing = readDefaultLanding();
    if (landing.startsWith("dashboard:")) {
      const id = landing.slice("dashboard:".length);
      if (id) {
        redirected.current = true;
        router.replace(`/app/dashboards/${id}`);
      }
    }
  }, [router, search]);

  return <>{children}</>;
}

export default function ControlCenterPage() {
  return (
    <div className="rp-command rp-command-cc">
      <Suspense fallback={null}>
        <DefaultLandingGate>
          <ControlCenter />
        </DefaultLandingGate>
      </Suspense>
    </div>
  );
}
