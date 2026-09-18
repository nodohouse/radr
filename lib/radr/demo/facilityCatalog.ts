/**
 * Facility visuals + equipment — industry-native room/unit/zone identity.
 * Helps managers and new staff see differences that usually fall under the radar.
 */

export type FacilityEquipment = {
  id: string;
  label: string;
  /** Under-radar signal when not obvious from PMS status */
  watch?: string;
};

export type FacilityTypeVisual = {
  id: string;
  vertical: "boutique_hotel" | "serviced_apartments" | "restaurant_full_service";
  label: string;
  shortLabel: string;
  imageSrc: string;
  imageAlt: string;
  beds?: string;
  sizeHint: string;
  viewHint?: string;
  equipment: FacilityEquipment[];
  /** What new staff often miss */
  underRadar: string[];
  differentiator: string;
};

export const HOTEL_ROOM_TYPES: Record<string, FacilityTypeVisual> = {
  "Classic Queen": {
    id: "classic_queen",
    vertical: "boutique_hotel",
    label: "Classic Queen",
    shortLabel: "Queen",
    imageSrc: "/demo/facilities/canal-classic-queen.jpg",
    imageAlt: "Classic Queen room mockup",
    beds: "1× Queen",
    sizeHint: "~18 m²",
    viewHint: "Courtyard / street",
    equipment: [
      { id: "ac", label: "AC" },
      { id: "safe", label: "Safe" },
      { id: "minibar", label: "Minibar", watch: "Restock often skipped on stayovers" },
      { id: "desk", label: "Desk" },
      { id: "shower", label: "Shower only" },
      { id: "wifi", label: "Wi‑Fi" },
    ],
    underRadar: [
      "No bathtub — do not promise bath to guests",
      "Smaller desk — poor for long work stays",
      "Minibar restock lag after stayover",
    ],
    differentiator: "Compact · best for 1–2 night city stays",
  },
  "Deluxe King": {
    id: "deluxe_king",
    vertical: "boutique_hotel",
    label: "Deluxe King",
    shortLabel: "Deluxe",
    imageSrc: "/demo/facilities/canal-deluxe-king.jpg",
    imageAlt: "Deluxe King room mockup",
    beds: "1× King",
    sizeHint: "~24 m²",
    viewHint: "Canal / partial canal",
    equipment: [
      { id: "ac", label: "AC" },
      { id: "safe", label: "Safe" },
      { id: "minibar", label: "Minibar +" },
      { id: "desk", label: "Work desk" },
      { id: "bath", label: "Bath + shower" },
      { id: "robe", label: "Robes" },
      { id: "kettle", label: "Kettle" },
      { id: "wifi", label: "Wi‑Fi" },
    ],
    underRadar: [
      "Upgrade path from Classic Queen when ADR story allows",
      "Bath tub — call out for families / longer stays",
      "Higher contribution on direct than OTA",
    ],
    differentiator: "Work-ready · bath · stronger ADR",
  },
  "Canal Suite": {
    id: "canal_suite",
    vertical: "boutique_hotel",
    label: "Canal Suite",
    shortLabel: "Suite",
    imageSrc: "/demo/facilities/canal-suite.jpg",
    imageAlt: "Canal Suite mockup",
    beds: "1× King + sofa",
    sizeHint: "~38 m²",
    viewHint: "Canal front",
    equipment: [
      { id: "ac", label: "AC" },
      { id: "living", label: "Living area" },
      { id: "minibar", label: "Full minibar" },
      { id: "nespresso", label: "Nespresso" },
      { id: "bath", label: "Bath + rain shower" },
      { id: "robe", label: "Robes + slippers" },
      { id: "welcome", label: "Welcome tray" },
      { id: "wifi", label: "Wi‑Fi" },
    ],
    underRadar: [
      "Anniversary / returning guests — champagne tray ready",
      "Sofa bed not sold as second bedroom unless asked",
      "Highest review sensitivity — overnight issues land harder",
    ],
    differentiator: "Living space · canal · relationship inventory",
  },
};

export const RESIDENCE_UNIT_TYPES: Record<string, FacilityTypeVisual> = {
  Studio: {
    id: "studio",
    vertical: "serviced_apartments",
    label: "Studio",
    shortLabel: "Studio",
    imageSrc: "/demo/facilities/lisbon-studio.jpg",
    imageAlt: "Studio apartment mockup",
    beds: "1× Double",
    sizeHint: "~28 m²",
    equipment: [
      { id: "kitchen", label: "Kitchenette" },
      { id: "washer", label: "Washer" },
      { id: "ac", label: "AC" },
      { id: "wifi", label: "Wi‑Fi" },
      { id: "desk", label: "Desk" },
    ],
    underRadar: [
      "No separate bedroom — disclose for couples staying 7+ nights",
      "Washer cycle time affects same-day turnover",
    ],
    differentiator: "Compact · strong for short stays / orphan nights",
  },
  "One Bed": {
    id: "one_bed",
    vertical: "serviced_apartments",
    label: "One Bed",
    shortLabel: "1 Bed",
    imageSrc: "/demo/facilities/lisbon-onebed.jpg",
    imageAlt: "One bedroom apartment mockup",
    beds: "1× Queen",
    sizeHint: "~45 m²",
    equipment: [
      { id: "kitchen", label: "Full kitchen" },
      { id: "washer", label: "Washer-dryer" },
      { id: "ac", label: "AC" },
      { id: "wifi", label: "Wi‑Fi" },
      { id: "sofa", label: "Sofa" },
      { id: "desk", label: "Work desk" },
    ],
    underRadar: [
      "Most requested for remote workers — desk + Wi‑Fi matter",
      "Turnover includes kitchen deep-clean (~+12 min)",
    ],
    differentiator: "Separate bedroom · work stays",
  },
  "Two Bed": {
    id: "two_bed",
    vertical: "serviced_apartments",
    label: "Two Bed",
    shortLabel: "2 Bed",
    imageSrc: "/demo/facilities/lisbon-onebed.jpg",
    imageAlt: "Two bedroom apartment mockup",
    beds: "1× Queen + 2× Single",
    sizeHint: "~68 m²",
    equipment: [
      { id: "kitchen", label: "Full kitchen" },
      { id: "washer", label: "Washer-dryer" },
      { id: "ac", label: "AC ×2" },
      { id: "wifi", label: "Wi‑Fi" },
      { id: "sofa", label: "Sofa bed" },
    ],
    underRadar: [
      "AC failure blocks whole unit — higher revenue exposure",
      "Longer clean · do not schedule back-to-back tight turnovers",
    ],
    differentiator: "Families / groups · highest maintenance impact",
  },
  Loft: {
    id: "loft",
    vertical: "serviced_apartments",
    label: "Loft",
    shortLabel: "Loft",
    imageSrc: "/demo/facilities/canal-suite.jpg",
    imageAlt: "Loft apartment mockup",
    beds: "1× King mezzanine",
    sizeHint: "~55 m²",
    equipment: [
      { id: "kitchen", label: "Open kitchen" },
      { id: "stairs", label: "Mezzanine stairs" },
      { id: "ac", label: "AC" },
      { id: "wifi", label: "Wi‑Fi" },
    ],
    underRadar: [
      "Stairs — not suitable for mobility-limited guests",
      "Mezzanine heat in summer — AC critical",
    ],
    differentiator: "Design-led · accessibility caveat",
  },
};

/** Restaurant zones — what FOH/new staff need to “see” without a floor walk. */
export const RESTAURANT_ZONES: FacilityTypeVisual[] = [
  {
    id: "main_dining",
    vertical: "restaurant_full_service",
    label: "Main Dining",
    shortLabel: "Dining",
    imageSrc: "/demo/facilities/berlin-dining.jpg",
    imageAlt: "Main dining room mockup",
    sizeHint: "96 covers",
    equipment: [
      { id: "pos", label: "POS stations ×2" },
      { id: "allergy", label: "Allergy cards" },
      { id: "wine", label: "Wine station" },
    ],
    underRadar: [
      "Tables 11–14 share one server path — peak bottleneck",
      "Allergy cards live at pass, not host stand",
    ],
    differentiator: "Core covers · highest labor leverage",
  },
  {
    id: "terrace",
    vertical: "restaurant_full_service",
    label: "Terrace",
    shortLabel: "Terrace",
    imageSrc: "/demo/facilities/berlin-terrace.jpg",
    imageAlt: "Terrace zone mockup",
    sizeHint: "36 covers",
    equipment: [
      { id: "heaters", label: "Heaters ×4" },
      { id: "blankets", label: "Blankets" },
      { id: "pos", label: "Mobile POS" },
    ],
    underRadar: [
      "Weather gate — rain closes capacity and changes contribution math",
      "Blankets often missing after rain nights",
    ],
    differentiator: "Weather-sensitive perishable capacity",
  },
  {
    id: "bar",
    vertical: "restaurant_full_service",
    label: "Bar",
    shortLabel: "Bar",
    imageSrc: "/demo/facilities/berlin-bar.jpg",
    imageAlt: "Bar zone mockup",
    sizeHint: "18 seats",
    equipment: [
      { id: "draft", label: "Draft lines" },
      { id: "ice", label: "Ice well" },
      { id: "pos", label: "POS" },
    ],
    underRadar: [
      "Walk-in absorption when terrace closes or dining waits",
      "Draft line clean schedule often missed",
    ],
    differentiator: "Walk-in buffer · beverage contribution",
  },
];

export function hotelFacilityForType(
  type: string,
): FacilityTypeVisual | undefined {
  return HOTEL_ROOM_TYPES[type];
}

export function residenceFacilityForType(
  type: string,
): FacilityTypeVisual | undefined {
  return RESIDENCE_UNIT_TYPES[type];
}
