"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LAB_NAV } from "@/lib/lab/world";
import { useLab } from "./LabProvider";
import { TriangleMark } from "./TriangleMark";

function navOn(pathname: string, href: string) {
  const base = href.split("?")[0];
  if (base === "/app/lab/control-center") {
    return pathname === base || pathname === "/app/lab";
  }
  return pathname === base || pathname.startsWith(`${base}/`);
}

export function LabShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const { seed, role, world, setSeed, setRole } = useLab();

  return (
    <div className="lab-os" data-seed={seed} data-role={role}>
      <div className="lab-shell">
        <aside className="lab-rail" aria-label="RADR lab">
          <Link href="/app/lab/control-center" className="lab-rail-brand" aria-label="RADR Control Center">
            <TriangleMark size={34} />
            <span className="lab-rail-word">RADR</span>
          </Link>
          <nav>
            {LAB_NAV.map((item) => (
              <Link
                key={item.id}
                href={item.id === "center" ? `${item.href}?seed=${seed}` : item.href}
                className="lab-rail-link"
                data-on={navOn(pathname, item.href)}
              >
                <TriangleMark size={14} />
                <em>{item.label}</em>
              </Link>
            ))}
          </nav>
        </aside>

        <div className="lab-main">
          <header className="lab-top">
            <div>
              <p className="lab-top-loc">{world.location}</p>
              <div className="lab-top-meta">
                <span>{world.serviceLabel}</span>
                <span>{world.nowLabel}</span>
                <span className="lab-live">
                  <i aria-hidden="true" />
                  {world.liveNote}
                </span>
              </div>
            </div>

            <div className="lab-roles" role="tablist" aria-label="Role lens">
              {(["gm", "cfo", "clevel"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  className="lab-pill"
                  data-on={role === r}
                  data-tone="acid"
                  onClick={() => setRole(r)}
                >
                  {r === "clevel" ? "C-level" : r.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="lab-seeds" aria-label="Demo seed">
              {(["service", "hotel", "recover"] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  className="lab-pill"
                  data-on={seed === s}
                  onClick={() => setSeed(s)}
                >
                  {s === "service" ? "Restaurant" : s === "hotel" ? "Hotel" : "Recover"}
                </button>
              ))}
            </div>
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}
