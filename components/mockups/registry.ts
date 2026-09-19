export type MockupMeta = {
  slug: string;
  href: string;
  number: string;
  title: string;
  statement: string;
  /** Native 3840×2160 PNG in /public/mockup-exports */
  png: string;
};

export const MOCKUPS: MockupMeta[] = [
  {
    slug: "control-center",
    href: "/mockups/control-center",
    number: "01",
    title: "Control Center",
    statement: "RADR sees the entire operation.",
    png: "/mockup-exports/radr-control-center-3840x2160.png",
  },
  {
    slug: "intelligence",
    href: "/mockups/intelligence",
    number: "02",
    title: "Intelligence",
    statement: "Watch the engine think.",
    png: "/mockup-exports/radr-intelligence-3840x2160.png",
  },
  {
    slug: "action",
    href: "/mockups/action",
    number: "03",
    title: "Action",
    statement: "Not just findings - what to do.",
    png: "/mockup-exports/radr-action-3840x2160.png",
  },
  {
    slug: "closed-loop",
    href: "/mockups/closed-loop",
    number: "04",
    title: "Closed Loop",
    statement: "Every outcome makes RADR smarter.",
    png: "/mockup-exports/radr-closed-loop-3840x2160.png",
  },
  {
    slug: "integrations",
    href: "/mockups/integrations",
    number: "05",
    title: "Integrations",
    statement: "Intelligence layer above the stack.",
    png: "/mockup-exports/radr-integrations-3840x2160.png",
  },
  {
    slug: "hospitality",
    href: "/mockups/hospitality",
    number: "06",
    title: "Hospitality",
    statement: "Invisible above the operation.",
    png: "/mockup-exports/radr-hospitality-3840x2160.png",
  },
];
