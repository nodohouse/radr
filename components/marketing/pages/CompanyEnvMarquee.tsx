"use client";

/**
 * Company environments marquee — depth first, breadth second.
 * Uniform photo tiles. Scope badges separate pilot focus from roadmap.
 * ONE semantic list only; visual marquee clones are aria-hidden + inert.
 */

import Image from "next/image";
import { useId } from "react";
import { usePrefersReducedMotion } from "@/components/marketing/motion/usePrefersReducedMotion";
import {
  marketingImage,
  type MarketingImageId,
} from "@/lib/marketing/publicImagery";

type EnvScope = "now" | "next";

type EnvTile = {
  id: string;
  label: string;
  imageId: MarketingImageId;
  /** Supporting now = pilot / active architecture. Next = on the map. */
  scope: EnvScope;
};

/** Supported now — equal weight restaurants + hotels. */
const NOW: EnvTile[] = [
  {
    id: "restaurants",
    label: "Restaurants & restaurant groups",
    imageId: "companyRestaurant",
    scope: "now",
  },
  {
    id: "hotels",
    label: "Hotels & hotel groups",
    imageId: "companyHotel",
    scope: "now",
  },
  {
    id: "groups",
    label: "Multi-location hospitality groups",
    imageId: "companyGroup",
    scope: "now",
  },
];

/** Architecture supports / expanding — not every tile is a live pilot surface. */
const NEXT: EnvTile[] = [
  {
    id: "apartments",
    label: "Serviced apartments",
    imageId: "companyApartments",
    scope: "next",
  },
  {
    id: "bars",
    label: "Bars & clubs",
    imageId: "companyEnvBar",
    scope: "next",
  },
  {
    id: "resorts",
    label: "Resorts",
    imageId: "companyEnvBoutique",
    scope: "next",
  },
  {
    id: "private-dining",
    label: "Private dining",
    imageId: "companyEnvPrivateDining",
    scope: "next",
  },
  {
    id: "aparthotels",
    label: "Aparthotels",
    imageId: "companyEnvAparthotel",
    scope: "next",
  },
  {
    id: "vacation",
    label: "Other hospitality operations",
    imageId: "companyEnvVacation",
    scope: "next",
  },
];

export const COMPANY_ENV_TILES: EnvTile[] = [...NOW, ...NEXT];

function EnvFigure({
  tile,
  semantic,
}: {
  tile: EnvTile;
  /** When true, figcaption is semantic (reduced-motion grid). */
  semantic?: boolean;
}) {
  const img = marketingImage(tile.imageId);

  return (
    <figure
      className="rx-co2-env-tile"
      data-scope={tile.scope}
      {...(semantic ? {} : { "aria-hidden": true as const })}
    >
      <div className="rx-co2-env-tile-media">
        <Image
          src={img.src}
          alt=""
          width={540}
          height={405}
          sizes="(max-width: 720px) 184px, 216px"
          style={{ objectPosition: `${img.focalX} ${img.focalY}` }}
          loading="lazy"
          quality={80}
        />
      </div>
      <figcaption>{tile.label}</figcaption>
    </figure>
  );
}

export function CompanyEnvMarquee() {
  const reduced = usePrefersReducedMotion();
  const uid = useId();
  const tiles = COMPANY_ENV_TILES;

  if (reduced) {
    return (
      <div className="rx-co2-env-marquee" data-reduced="true">
        <ul
          className="rx-co2-env-marquee-static"
          aria-label="Hospitality environments by scope"
        >
          {tiles.map((tile) => (
            <li key={tile.id}>
              <EnvFigure tile={tile} semantic />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const loop = [...tiles, ...tiles];

  return (
    <div className="rx-co2-env-marquee">
      <div className="rx-co2-env-track" aria-hidden="true" inert>
        {loop.map((tile, i) => (
          <div key={`${uid}-${tile.id}-${i}`} className="rx-co2-env-track-item">
            <EnvFigure tile={tile} />
          </div>
        ))}
      </div>
      <ul className="sr-only" aria-label="Hospitality environments">
        {tiles.map((tile) => (
          <li key={tile.id}>{tile.label}</li>
        ))}
      </ul>
    </div>
  );
}
