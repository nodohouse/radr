import Link from "next/link";
import { RadrWordmark } from "@/components/radr/RadrWordmark";
import { MOCKUPS } from "@/components/mockups/registry";

export default function MockupsIndexPage() {
  return (
    <main className="mk-index">
      <header className="mk-index-head">
        <div>
          <p className="mk-index-kicker">Internal · 3840 × 2160</p>
          <h1 className="mk-index-title">
            <RadrWordmark size="lg" variant="luminous" surface="dark" />{" "}
            presentation mockups
          </h1>
        </div>
        <p className="mk-index-note">
          Open a composition to preview, or download the native 4K PNG.
        </p>
      </header>

      <ul className="mk-index-list">
        {MOCKUPS.map((m) => (
          <li key={m.slug} className="mk-index-row">
            <Link href={m.href} className="mk-index-open">
              <span className="mk-index-num">{m.number}</span>
              <span className="mk-index-name">{m.title}</span>
              <span className="mk-index-stmt">{m.statement}</span>
            </Link>
            <a className="mk-index-dl" href={m.png} download>
              Download PNG
            </a>
          </li>
        ))}
      </ul>
    </main>
  );
}
