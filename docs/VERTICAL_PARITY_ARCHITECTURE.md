# Vertical Parity Architecture

**Thesis:** One Decision architecture. Two operating worlds.

```
EVIDENCE → FINDING → MATERIALITY → FUTURES → DECISION
→ ACTION → OUTCOME → VERIFICATION → VERIFIED VALUE → MEMORY
```

The vertical changes: **data · operating model · visualization · language · Decision classes.**  
The core system does not.

## First-class demo organizations

| Org | ID | Vertical | Flagship |
|---|---|---|---|
| Northstar Restaurants | `org_northstar_restaurants` | restaurant | Berlin Mitte |
| Northstar Hotels | `org_northstar_hotels` | hotel | Canal House |

Legacy mixed `org_northstar` remains for internal continuity only.

## VerticalExperienceProfile

`lib/radr/vertical/experienceProfile.ts`

Profiles own:

- demand / capacity / economic units
- live hero + operating flow types
- pulse metrics + intelligence priorities
- Decision types + role profiles
- forbidden lexicon (language QA)
- visualization registry

**Rule:** Do not scatter `if (restaurant)` / `if (hotel)` through leaf components. Compose from the profile.

## Composition path

```
DemoOrgSwitcher
  → writeDemoOrgSession(vertical)
  → useDemoOrg()
  → ControlCenter data-vertical
       restaurant → CcCockpit
       hotel      → HotelCockpit
  → CcFocusMode live
       restaurant → LiveCommandSurface
       hotel      → HotelLiveSurface
```

## Shared grammar

Same Control Center rows:

1. Operating situation + Need your judgment  
2. Business pulse + Now + Next  
3. Locations + vertical module + Performance + History  

Different content and visuals.

## Docs

- `VERTICAL_EXPERIENCE_PROFILE.md`
- `RESTAURANT_DEMO_DATASET.md`
- `HOTEL_DEMO_DATASET.md`
- `HOTEL_DECISION_CATALOG.md`
- `VERTICAL_PARITY_QA.md`
