/**
 * External social profiles for RADR.
 *
 * TODO: Insert real company profile URLs when accounts are live.
 * Never invent handles or placeholder vanity URLs.
 *
 * Example once ready:
 *   linkedin: "https://www.linkedin.com/company/radr"
 *   instagram: "https://www.instagram.com/radr"
 */
export const SOCIAL_LINKS = {
  /** TODO: real LinkedIn company URL */
  linkedin: process.env.NEXT_PUBLIC_RADR_LINKEDIN_URL?.trim() || "",
  /** TODO: real Instagram profile URL */
  instagram: process.env.NEXT_PUBLIC_RADR_INSTAGRAM_URL?.trim() || "",
  /** Optional: only render when set */
  x: process.env.NEXT_PUBLIC_RADR_X_URL?.trim() || "",
} as const;

export type SocialNetwork = keyof typeof SOCIAL_LINKS;

export type SocialLinkItem = {
  id: SocialNetwork;
  label: string;
  /** Empty = configured UI, not yet linkable */
  href: string;
  /** Always show LinkedIn + Instagram in footer */
  alwaysShow: boolean;
};

const META: Record<
  SocialNetwork,
  { label: string; alwaysShow: boolean }
> = {
  linkedin: { label: "LinkedIn", alwaysShow: true },
  instagram: { label: "Instagram", alwaysShow: true },
  x: { label: "X", alwaysShow: false },
};

/** Footer socials: always-show networks + any optional network with a real URL. */
export function footerSocialLinks(): SocialLinkItem[] {
  return (Object.keys(SOCIAL_LINKS) as SocialNetwork[])
    .map((id) => ({
      id,
      label: META[id].label,
      href: SOCIAL_LINKS[id],
      alwaysShow: META[id].alwaysShow,
    }))
    .filter((item) => item.alwaysShow || item.href.length > 0);
}

/** @deprecated use footerSocialLinks */
export function activeSocialLinks(): SocialLinkItem[] {
  return footerSocialLinks();
}

export function hasAnySocialLinks(): boolean {
  return footerSocialLinks().length > 0;
}
