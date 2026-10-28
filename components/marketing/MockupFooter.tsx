import Image from "next/image";
import Link from "next/link";
import { LegalIdentity } from "./LegalIdentity";
import { contactEmail } from "./config/company";
import "./mockup-pages.css";

const columns = [
  {
    title: "Platform",
    links: [
      ["Overview", "/how#overview"],
      ["Control Center", "/how#operating-state"],
      ["Live", "/how#operating-state"],
      ["Decisions", "/how#decisions"],
      ["Operations", "/solutions#operations"],
      ["Intelligence", "/how#intelligence"],
      ["Value", "/value-calculator#results"],
      ["Data Health", "/how#foundation"],
    ],
  },
  {
    title: "Solutions",
    links: [
      ["Restaurants", "/solutions#tailored"],
      ["Hotels", "/solutions#tailored"],
      ["Multi-site groups", "/solutions#tailored"],
      ["Finance", "/solutions#reconciliation"],
      ["Procurement", "/solutions#procurement"],
      ["Labor", "/solutions#labor"],
    ],
  },
  {
    title: "Company",
    links: [
      ["About us", "/company#mission"],
      ["Our approach", "/company#approach"],
      ["Our values", "/company#values"],
      ["Contact", "/contact"],
    ],
  },
  {
    title: "Resources",
    links: [
      ["Platform overview", "/how"],
      ["Use cases", "/solutions"],
      ["Value calculator", "/value-calculator"],
      ["Questions & answers", "/pricing#faq"],
      ["Security", "/security"],
      ["Support", "/contact"],
    ],
  },
];
export function MockupFooter() {
  const email = contactEmail();
  return (
    <footer className="mx-footer">
      <div className="mx-wrap">
        <div className="mx-footer-grid">
          <div className="mx-footer-brand">
            <Link href="/en" aria-label="RADR home">
              <Image
                src="/brand/radr-wordmark-clean-white.svg"
                width={180}
                height={41}
                alt="RADR"
              />
            </Link>
            <p>Hospitality operating intelligence.</p>
            <p>
              Turn your data into better decisions, higher profits and stronger
              guest experiences.
            </p>
          </div>
          {columns.map((column) => (
            <nav key={column.title} aria-label={`Footer ${column.title}`}>
              <h2>{column.title}</h2>
              {column.links.map(([title, href]) => (
                <Link href={href} key={title}>
                  {title}
                </Link>
              ))}
            </nav>
          ))}
          <div className="mx-footer-contact">
            <h2>Contact</h2>
            {email ? (
              <a href={`mailto:${email}`}>{email}</a>
            ) : (
              <p>
                Contact details
                <br />
                to be confirmed.
              </p>
            )}
            <Link href="/contact">
              Contact RADR <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
        <div className="mx-footer-legal">
          <nav aria-label="Legal policies">
            <h2>Legal</h2>
            <Link href="/terms">Terms of Service</Link>
            <Link href="/privacy">Privacy Policy</Link>
            <Link href="/security">Security</Link>
            <Link href="/responsible-ai">Responsible AI</Link>
            <Link href="/data-processing-agreement">
              Data Processing Agreement
            </Link>
          </nav>
          <div>
            <h2>Imprint / Legal Notice</h2>
            <LegalIdentity />
          </div>
        </div>
        <div className="mx-footer-bottom">
          <span>© {new Date().getFullYear()} RADR. All rights reserved.</span>
          <nav aria-label="Legal shortcuts">
            <Link href="/terms">Terms</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/security">Security</Link>
            <Link href="/imprint">Imprint</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
