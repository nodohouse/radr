"use client";

import Image from "next/image";
import type { EnterWorld } from "@/lib/radr/demo/enterWorlds";
import {
  BedIcon,
  ForkKnifeIcon,
  ModuleIcon,
  PinIcon,
} from "@/components/product/enter/GatewayIcons";
import { GatewayPerformanceGlass } from "@/components/product/enter/GatewayPerformanceGlass";

type Props = {
  world: EnterWorld;
  selected: boolean;
  lastVisited: boolean;
  onSelect: () => void;
  onEnter: () => void;
};

export function GatewayWorldCard({
  world,
  selected,
  lastVisited,
  onSelect,
  onEnter,
}: Props) {
  const groupLabel =
    world.id === "restaurant" ? "Restaurant group" : "Hotel group";
  const citiesLine = `${world.cities.join(" · ")}${
    world.citiesExtra > 0 ? ` +${world.citiesExtra}` : ""
  }`;

  return (
    <li>
      <article
        className="rgw-card"
        data-world={world.id}
        data-selected={selected ? "true" : undefined}
        data-last={lastVisited ? "true" : undefined}
        onMouseEnter={onSelect}
        onFocusCapture={onSelect}
      >
        <div className="rgw-card-media">
          <Image
            src={world.imageSrc}
            alt={world.imageAlt}
            fill
            sizes="(max-width: 920px) 100vw, 540px"
            priority
            quality={92}
            style={{ objectFit: "cover" }}
          />
          <div className="rgw-card-media-veil" />
          <GatewayPerformanceGlass world={world} />
        </div>

        <div className="rgw-card-body">
          <div className="rgw-card-icon-wrap" aria-hidden>
            {world.id === "restaurant" ? (
              <ForkKnifeIcon className="rgw-card-icon" />
            ) : (
              <BedIcon className="rgw-card-icon" />
            )}
          </div>

          <div>
            <h2 className="rgw-card-label">{world.title}</h2>
            <p className="rgw-card-meta">{world.meta}</p>
          </div>

          <p className="rgw-card-copy">{world.description}</p>

          <ul className="rgw-modules" aria-label={`${world.title} modules`}>
            {world.modules.map((m) => (
              <li key={m.id}>
                <ModuleIcon id={m.id} />
                <span>{m.label}</span>
              </li>
            ))}
          </ul>

          <p className="rgw-cities">
            <PinIcon />
            <span>{citiesLine}</span>
          </p>

          <button
            type="button"
            className="rgw-cta"
            aria-label={groupLabel}
            onClick={onEnter}
          >
            {world.cta}
          </button>
        </div>
      </article>
    </li>
  );
}
