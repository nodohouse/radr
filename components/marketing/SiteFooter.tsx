import Link from "next/link";
import { RadrWordmark } from "./RadrWordmark";

export function SiteFooter() {
  return (
    <footer className="radr-footer">
      <div className="radr-footer-inner">
        <RadrWordmark as="p" size="md" />
        <nav aria-label="Footer">
          <Link href="/#product">Product</Link>
          <Link href="/#how">How it works</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/security">Security</Link>
          <Link href="/login">Sign in</Link>
        </nav>
      </div>
    </footer>
  );
}
