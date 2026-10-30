# DASHBOARD QA

**Date:** 2026-09-30 · Wave C

## Routes

`/app/dashboards` · `/app/dashboards/[id]`

## Templates

`dash_gm` · `dash_coo` · `dash_cfo` · `dash_friday_dinner` · `dash_restaurant_live` · `dash_hotel_ops` · `dash_head_chef`

## Rules

- Persist pins / default landing via local store
- Hotel templates must not use restaurant-only `live_service` as sole module
- No drag overlap after layout settle

## Status

PARTIAL → acceptable for READY if no P0 blank/crash. Drag collision = P1 if reproduced.
