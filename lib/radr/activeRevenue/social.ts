/**
 * Social channel providers + recovery template library (demo).
 * Capability flags stay honest - no fake publish APIs.
 */

import type {
  BrandVoicePreset,
  RecoveryTemplate,
  SocialChannelProvider,
  SocialRecoveryPreview,
  SocialRecoveryRoi,
  StoryVisualStyle,
} from "./liveRecovery";

const ORG = "org_northstar";
const LOC = "loc_ber";

export function demoSocialProviders(): SocialChannelProvider[] {
  return [
    {
      id: "instagram",
      name: "Instagram",
      connected: true,
      lastSyncLabel: "Live",
      canPublishPost: true,
      canPublishStory: true,
      canPublishVideo: true,
      canSchedule: false,
      canSendMessage: false,
      canAttachBookingLink: true,
      canTrackClicks: true,
      supportsDraftOnly: false,
      requiresApproval: true,
      notes: "Stories + feed. Publishing requires approval by default.",
    },
    {
      id: "facebook",
      name: "Facebook",
      connected: true,
      lastSyncLabel: "12 min ago",
      canPublishPost: true,
      canPublishStory: true,
      canPublishVideo: false,
      canSchedule: true,
      canSendMessage: false,
      canAttachBookingLink: true,
      canTrackClicks: true,
      supportsDraftOnly: false,
      requiresApproval: true,
    },
    {
      id: "whatsapp",
      name: "WhatsApp Business",
      connected: true,
      lastSyncLabel: "Live",
      canPublishPost: false,
      canPublishStory: false,
      canPublishVideo: false,
      canSchedule: false,
      canSendMessage: true,
      canAttachBookingLink: true,
      canTrackClicks: true,
      supportsDraftOnly: false,
      requiresApproval: true,
    },
    {
      id: "tiktok",
      name: "TikTok",
      connected: true,
      lastSyncLabel: "Yesterday",
      canPublishPost: false,
      canPublishStory: false,
      canPublishVideo: true,
      canSchedule: false,
      canSendMessage: false,
      canAttachBookingLink: true,
      canTrackClicks: false,
      supportsDraftOnly: true,
      requiresApproval: true,
      notes: "Draft only - no auto-publish for cancellations.",
    },
    {
      id: "x",
      name: "X",
      connected: false,
      lastSyncLabel: null,
      canPublishPost: false,
      canPublishStory: false,
      canPublishVideo: false,
      canSchedule: false,
      canSendMessage: false,
      canAttachBookingLink: false,
      canTrackClicks: false,
      supportsDraftOnly: true,
      requiresApproval: true,
    },
  ];
}

export function demoRecoveryTemplates(): RecoveryTemplate[] {
  return [
    {
      id: "tpl_last_premium_b",
      organizationId: ORG,
      locationId: LOC,
      name: "Candlelit - Premium",
      templateType: "LAST_TABLE_TONIGHT",
      supportedChannels: ["instagram", "facebook"],
      brandVoice: "PREMIUM",
      storyVisual: "candlelit",
      copyStructure:
        "An unexpected table has become available this evening.\n\n{{time}}\n{{partySize}} guests\n\n{{location}}\n\n{{bookingLink}}",
      variables: ["time", "partySize", "location", "bookingLink"],
      assetRules: "Candlelit dining room · brand approved",
      ctaStyle: "Reserve →",
      favorite: true,
      lockedByBrand: true,
      automationEligible: true,
      approvalRequired: true,
      timesUsed: 28,
      bookings: 14,
      fillRatePct: 50,
      avgFillMinutes: 11,
      verifiedRecoveredRevenue: 3420,
    },
    {
      id: "tpl_last_minimal",
      organizationId: ORG,
      locationId: LOC,
      name: "Linen - Minimal",
      templateType: "LAST_TABLE_TONIGHT",
      supportedChannels: ["instagram", "whatsapp"],
      brandVoice: "MINIMAL",
      storyVisual: "linen",
      copyStructure:
        "One table opened tonight.\n\n{{time}}\n{{partySize}} guests\n\n{{location}}\n\n{{bookingLink}}",
      variables: ["time", "partySize", "location", "bookingLink"],
      assetRules: "Soft linen light · dining still",
      ctaStyle: "Reserve →",
      favorite: true,
      lockedByBrand: false,
      automationEligible: true,
      approvalRequired: true,
      timesUsed: 19,
      bookings: 7,
      fillRatePct: 37,
      avgFillMinutes: 14,
      verifiedRecoveredRevenue: 1680,
    },
    {
      id: "tpl_noshow_warm",
      organizationId: ORG,
      locationId: LOC,
      name: "Warm welcome",
      templateType: "NO_SHOW_OPENING",
      supportedChannels: ["whatsapp", "instagram"],
      brandVoice: "WARM",
      storyVisual: "chef",
      copyStructure:
        "A table just opened for tonight. We'd love to have you.\n\n{{time}} · {{partySize}} guests\n\n{{location}}\n\n{{bookingLink}}",
      variables: ["time", "partySize", "location", "bookingLink"],
      assetRules: "Warm kitchen / plating atmosphere",
      ctaStyle: "Book a table",
      favorite: false,
      lockedByBrand: false,
      automationEligible: false,
      approvalRequired: true,
      timesUsed: 9,
      bookings: 3,
      fillRatePct: 33,
      avgFillMinutes: 18,
      verifiedRecoveredRevenue: 620,
    },
    {
      id: "tpl_terrace",
      organizationId: ORG,
      locationId: LOC,
      name: "Terrace evening",
      templateType: "TERRACE_OPEN",
      supportedChannels: ["instagram", "facebook"],
      brandVoice: "ENERGETIC",
      storyVisual: "terrace",
      copyStructure:
        "Terrace table just opened.\n\n{{time}}\n{{partySize}} guests\n\n{{location}}\n\n{{bookingLink}}",
      variables: ["time", "partySize", "location", "bookingLink"],
      assetRules: "Terrace dusk · approved only",
      ctaStyle: "Reserve →",
      favorite: true,
      lockedByBrand: false,
      automationEligible: true,
      approvalRequired: true,
      timesUsed: 12,
      bookings: 5,
      fillRatePct: 42,
      avgFillMinutes: 16,
      verifiedRecoveredRevenue: 980,
    },
    {
      id: "tpl_bar_last",
      organizationId: ORG,
      locationId: LOC,
      name: "Bar counter glow",
      templateType: "BAR_SEATS",
      supportedChannels: ["instagram"],
      brandVoice: "ENERGETIC",
      storyVisual: "bar",
      copyStructure:
        "Last-minute seats at the bar.\n\n{{time}}\n{{partySize}} guests\n\n{{location}}\n\n{{bookingLink}}",
      variables: ["time", "partySize", "location", "bookingLink"],
      assetRules: "Bar atmosphere · amber backlight",
      ctaStyle: "Join us →",
      favorite: false,
      lockedByBrand: false,
      automationEligible: true,
      approvalRequired: true,
      timesUsed: 8,
      bookings: 4,
      fillRatePct: 50,
      avgFillMinutes: 9,
      verifiedRecoveredRevenue: 540,
    },
  ];
}

export function renderTemplateCopy(
  structure: string,
  vars: Record<string, string>,
): string {
  return structure.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? "");
}

export function brandVoiceLabel(v: BrandVoicePreset): string {
  switch (v) {
    case "MINIMAL":
      return "Minimal";
    case "PREMIUM":
      return "Premium";
    case "WARM":
      return "Warm";
    case "ENERGETIC":
      return "Energetic";
  }
}

export function storyVisualLabel(v: StoryVisualStyle): string {
  switch (v) {
    case "candlelit":
      return "Candlelit dining";
    case "terrace":
      return "Terrace dusk";
    case "linen":
      return "Linen light";
    case "chef":
      return "Kitchen warmth";
    case "bar":
      return "Bar glow";
  }
}

export function composeSocialPreview(input: {
  time: string;
  partySize: number;
  locationName: string;
  template?: RecoveryTemplate;
}): SocialRecoveryPreview {
  const templates = demoRecoveryTemplates();
  const tpl =
    input.template ??
    templates.find((t) => t.id === "tpl_last_premium_b") ??
    templates[0]!;
  const copy = renderTemplateCopy(tpl.copyStructure, {
    time: input.time,
    partySize: String(input.partySize),
    location: input.locationName,
    bookingLink: tpl.ctaStyle,
  });
  return {
    channelId: "instagram",
    channelName: "Instagram",
    format: "story",
    templateId: tpl.id,
    templateName: tpl.name,
    storyVisual: tpl.storyVisual,
    copy,
    assetLabel: tpl.assetRules,
    bookingLinkLabel: tpl.ctaStyle,
    historicalFillRatePct: tpl.fillRatePct,
    expectedFillMinutes: tpl.avgFillMinutes,
    requiresApproval: true,
    why: [
      "Highest historical fill rate for same-day tables at this location",
      "Waitlist first - social only if still open",
      "Never auto-publish without approval",
    ],
  };
}

export function demoSocialRecoveryRoi(): SocialRecoveryRoi {
  return {
    posts: 23,
    tablesFilled: 11,
    recoveryRatePct: 47.8,
    verifiedRecoveredRevenue: 2840,
    verifiedContribution: 1420,
    avgRecoveryMinutes: 14,
    topChannel: "WhatsApp",
    topTemplate: "Candlelit - Premium",
  };
}
