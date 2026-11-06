/** Public identity only. No unverified legal address, ratings, customers or certifications. */
export function MarketingEntityData() {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": "https://radrup.com/#organization",
        name: "RADR",
        url: "https://radrup.com",
        logo: "https://radrup.com/brand/radr-mark-master-v4.svg",
        slogan: "Nothing off the RADR.",
      },
      {
        "@type": "WebSite",
        "@id": "https://radrup.com/#website",
        name: "RADR",
        alternateName: "RADR hospitality decision intelligence",
        url: "https://radrup.com",
        publisher: { "@id": "https://radrup.com/#organization" },
        inLanguage: ["en", "de", "nl", "fr", "es"],
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
