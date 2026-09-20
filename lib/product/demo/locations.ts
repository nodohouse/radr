/** Demo location identity: addresses + visual marks (no stock photos). */
export type LocationMeta = {
  id: string;
  street: string;
  type: string;
  region: string;
  /** CSS gradient seed for demo identity mark */
  hue: number;
  /** Product operating profile id (HospitalityOperatingProfile). */
  operatingProfileId?: string;
};

export const LOCATION_META: Record<string, LocationMeta> = {
  loc_ber: {
    id: "loc_ber",
    street: "Torstraße 84",
    type: "Restaurant",
    region: "Germany",
    hue: 190,
    operatingProfileId: "restaurant_full_service",
  },
  loc_ber_kreuz: {
    id: "loc_ber_kreuz",
    street: "Oranienstraße 52",
    type: "Restaurant",
    region: "Germany",
    hue: 185,
    operatingProfileId: "restaurant_full_service",
  },
  loc_ams_canal: {
    id: "loc_ams_canal",
    street: "Keizersgracht 312",
    type: "Boutique Hotel",
    region: "Netherlands",
    hue: 168,
    operatingProfileId: "boutique_hotel",
  },
  loc_lis_residences: {
    id: "loc_lis_residences",
    street: "Rua da Misericórdia 78",
    type: "Serviced Apartments",
    region: "Portugal",
    hue: 152,
    operatingProfileId: "serviced_apartments",
  },
  loc_nyc: {
    id: "loc_nyc",
    street: "19 W 21st Street",
    type: "Restaurant",
    region: "United States",
    hue: 210,
    operatingProfileId: "restaurant_full_service",
  },
  loc_nyc_wvill: {
    id: "loc_nyc_wvill",
    street: "14 Christopher Street",
    type: "Restaurant",
    region: "United States",
    hue: 205,
    operatingProfileId: "restaurant_full_service",
  },
  loc_sf: {
    id: "loc_sf",
    street: "480 Hayes Street",
    type: "Restaurant",
    region: "United States",
    hue: 200,
    operatingProfileId: "restaurant_full_service",
  },
  loc_tyo: {
    id: "loc_tyo",
    street: "1-22-7 Jinnan, Shibuya",
    type: "Restaurant",
    region: "Japan",
    hue: 350,
    operatingProfileId: "restaurant_full_service",
  },
  loc_sin: {
    id: "loc_sin",
    street: "2 Bayfront Avenue",
    type: "Restaurant",
    region: "Singapore",
    hue: 160,
    operatingProfileId: "restaurant_full_service",
  },
  loc_dxb: {
    id: "loc_dxb",
    street: "Marina Walk, Dubai Marina",
    type: "Restaurant",
    region: "United Arab Emirates",
    hue: 35,
    operatingProfileId: "restaurant_full_service",
  },
  loc_syd: {
    id: "loc_syd",
    street: "42 Crown Street",
    type: "Restaurant",
    region: "Australia",
    hue: 145,
    operatingProfileId: "restaurant_full_service",
  },
  loc_ams: {
    id: "loc_ams",
    street: "Damrak 62",
    type: "Restaurant",
    region: "Netherlands",
    hue: 155,
    operatingProfileId: "restaurant_full_service",
  },
  loc_lon: {
    id: "loc_lon",
    street: "Dean Street 18",
    type: "Restaurant",
    region: "United Kingdom",
    hue: 220,
    operatingProfileId: "restaurant_full_service",
  },
  loc_par: {
    id: "loc_par",
    street: "Rue des Francs-Bourgeois 12",
    type: "Restaurant",
    region: "France",
    hue: 25,
    operatingProfileId: "restaurant_full_service",
  },
};

export function locationMeta(id: string) {
  return LOCATION_META[id];
}
