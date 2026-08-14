import Link from "next/link";
import { COMPANY } from "./config/company";
import { RadrWordmark } from "./RadrWordmark";
import { SocialIcons } from "./SocialIcons";

const PRODUCT = [
  { href: "/#product", label: "Product" },
  { href: "/how", label: "How it works" },
  { href: "/solutions", label: "Solutions" },
  { href: "/pricing", label: "Pricing" },
] as const;

const COMPANY_LINKS = [
  { href: "/company", label: "Company" },
  { href: "/security", label: "Security" },
  { href: "/contact", label: "Contact" },
] as const;

const LEGAL = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/imprint", label: "Imprint" },
] as const;

/** Quiet global footer — no decorative geometry. */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="rx-footer" data-nav-theme="dark">
      <div className="rx-footer-bg" aria-hidden="true">
        <div className="rx-footer-atm" />
      </div>

      <div className="rx-shell rx-footer-content">
        <div className="rx-footer-top">
          <div className="rx-footer-brand">
            <Link href="/" aria-label="RADR home" className="rx-footer-home">
              <RadrWordmark size="footer" className="rx-footer-mark" />
            </Link>
            <p className="rx-footer-slogan">{COMPANY.slogan}</p>
            <p className="rx-footer-tag">{COMPANY.tagline}</p>
          </div>

          <div className="rx-footer-cols">
            <nav className="rx-footer-col" aria-label="Product">
              <p className="rx-footer-col-title">Product</p>
              <ul>
                {PRODUCT.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav className="rx-footer-col" aria-label="Company">
              <p className="rx-footer-col-title">Company</p>
              <ul>
                {COMPANY_LINKS.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav className="rx-footer-col" aria-label="Legal">
              <p className="rx-footer-col-title">Legal</p>
              <ul>
                {LEGAL.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="rx-footer-col">
              <p className="rx-footer-col-title">Follow</p>
              <SocialIcons withLabels />
            </div>
          </div>
        </div>

        <div className="rx-footer-bottom">
          <p className="rx-footer-copy">
            © {year} {COMPANY.brandName}
          </p>
          <p className="rx-footer-domain">{COMPANY.domain}</p>
        </div>
      </div>
    </footer>
  );
}
