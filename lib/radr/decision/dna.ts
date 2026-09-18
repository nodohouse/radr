/**
 * Operating DNA — location dimensions that feed predictions.
 * One core; vertical config differs.
 */

export type RestaurantDNA = {
  vertical: "restaurant";
  weatherSensitivity: number;
  walkInElasticity: number;
  tableTurnDistribution: string;
  menuDemandElasticity: number;
  stockoutSensitivity: number;
  deliveryElasticity: number;
  staffingResponse: number;
  guestRepeatPatterns: string;
  recoveryEffectiveness: number;
};

export type HotelDNA = {
  vertical: "hotel";
  directBookingElasticity: number;
  OTAExposure: number;
  roomReadinessPatterns: string;
  housekeepingDuration: number;
  upgradeConversion: number;
  lateCheckoutBehavior: string;
  ancillaryAttachment: number;
  maintenanceRisk: number;
  guestReturnPatterns: string;
};

export type ApartmentDNA = {
  vertical: "apartment";
  orphanNightFill: number;
  cleaningDuration: number;
  turnoverRisk: number;
  maintenanceDrag: number;
  channelElasticity: number;
  lengthOfStayBehavior: string;
  directConversion: number;
  priceSensitivity: number;
};

export type OperatingDNA = RestaurantDNA | HotelDNA | ApartmentDNA;

export type OperatingDNAProfile = {
  locationId: string;
  locationLabel: string;
  dna: OperatingDNA;
  summary: string;
};
