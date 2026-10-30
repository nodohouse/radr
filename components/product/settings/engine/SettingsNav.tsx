"use client";

import {
  filterSettingsNav,
  type SettingsSectionId,
} from "@/lib/radr/product/settingsProofEngine";
import { IconSearch, NAV_ICONS } from "./SettingsIcons";

type Props = {
  section: SettingsSectionId;
  query: string;
  onQuery: (q: string) => void;
  onSelect: (id: SettingsSectionId) => void;
};

export function SettingsNav({ section, query, onQuery, onSelect }: Props) {
  const items = filterSettingsNav(query);

  return (
    <nav className="se-nav" aria-label="Settings sections" data-settings-nav="true">
      <label className="se-nav-search">
        <IconSearch />
        <input
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="Search settings..."
          aria-label="Search settings"
          data-testid="settings-search"
        />
        <kbd>⌘K</kbd>
      </label>

      <ul className="se-nav-list">
        {items.map((item) => {
          const Ico = NAV_ICONS[item.id] ?? NAV_ICONS.organization!;
          return (
            <li key={item.id}>
              <button
                type="button"
                className="se-nav-item"
                data-settings-nav-item={item.id}
                data-active={section === item.id ? "true" : undefined}
                aria-current={section === item.id ? "page" : undefined}
                onClick={() => onSelect(item.id)}
              >
                <span className="se-ico se-nav-ico" aria-hidden>
                  <Ico />
                </span>
                <span className="se-nav-copy">
                  <strong>{item.name}</strong>
                  <span>{item.detail}</span>
                </span>
                <span className="se-nav-chev" aria-hidden>
                  ›
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {items.length === 0 ? (
        <p className="se-stub" style={{ padding: 14, fontSize: 13 }}>
          No settings match “{query}”.
        </p>
      ) : null}
    </nav>
  );
}
