# Pet Haven

Cozy pet-care prototype for **Cocos Creator 3.8.8** + TypeScript. Mobile-first web, portrait 9:16. Design: [pet-casual-cozy-gdd.md](pet-casual-cozy-gdd.md).

Current scope: **Phase 2 — Hub and care loop**. Style/Room overlays and real art come in Phase 3–4.

## Assumptions

- Engine: Cocos Creator 3.8.8, 2D, web preview.
- No backend, login, payment, gacha, or multiplayer.
- Pet never dies. Stats stay in `0..100`. Offline decay is slow and capped.
- Cosmetic/furniture content is data-driven. UI must read catalogs, not hard-coded item lists.
- Missing art is OK: placeholders are colored shapes and labels. Keep `assetKey` values stable.
- Save key: `pet-haven-save` in `sys.localStorage`.
- New saves start with no pet selected. A save from Phase 1 that already has a pet still loads into the Hub.

## Architecture

```text
assets/scripts/
  data/          catalogs and first-run seed
  domain/        types, clamp/decay, feed rewards, equip/room checks
  services/      GameStateService, SaveService, ClockService
  events/        typed EventBus (pet/inventory/currency/room only)
  minigames/     bath steps + catch-toy rules (no Cocos types)
  ui/            Hub, overlays, mini-games, uiKit
```

`Component` code only calls services and renders. Stat rules and persistence live in `domain/` + `services/`.

## Sample catalogs

| Kind | Count | Ids |
| --- | --- | --- |
| Pets | 2 | `pet_mochi` (dog, likes kibble), `pet_miso` (cat, likes tuna) |
| Food | 3 | `food_kibble`, `food_tuna`, `food_treat` |
| Cosmetics | 8 | sailor hat, glasses, bandana, bell collar (cat), raincoat, hoodie (dog), leaf beret + moon cape (seasonal) |
| Furniture | 6 | bed, plant, window perch, cushion, lamp, autumn rug (seasonal) |
| Seasonal pack | 1 | `pack_autumn_cozy` |
| Room anchors | 4 | `left`, `center`, `right`, `floor` |

Starter inventory: 5 of each food, sailor hat equipped on Mochi, cozy bed on `floor`, 40 coins. You pick a pet before the Hub care loop.

## Scene / prefab contract

| Asset | Role |
| --- | --- |
| [assets/scenes/Main.scene](assets/scenes/Main.scene) | Portrait canvas 720×1280 with `GameBootstrap` on Canvas |
| Prefabs | None. Hub and overlays are built in code |

If the script is missing on Canvas after import:

1. Open `assets/scenes/Main.scene`.
2. Select **Canvas**.
3. Add Component → Custom Script → `GameBootstrap`.
4. Save the scene.

## How to run

1. Open this folder in **Cocos Creator 3.8.8**.
2. Wait until assets finish importing.
3. Open `assets/scenes/Main.scene`.
4. Click **Preview** (browser). Use a 9:16 device preset if available.
5. Choose Mochi or Miso → Feed / Clean / Play / Rest. Reload the tab: stats, coins, and daily progress remain.

Play is a 20–60s tap game (ball for dog, spark for cat). Clean is rinse → scrub → dry. Rest disables when energy is 90+. Style and Room show a Phase 3 placeholder with Back.

To wipe progress:

```js
localStorage.removeItem('pet-haven-save');
```

## Adding content (no service changes)

- Cosmetic: append a `CosmeticDefinition` in [assets/scripts/data/cosmetics.ts](assets/scripts/data/cosmetics.ts). Use a stable `id` and `assetKey`.
- Furniture: append in [assets/scripts/data/furniture.ts](assets/scripts/data/furniture.ts) and list `allowedAnchors`.
- Seasonal: add ids to the item definitions (`seasonalPackId`) and list those ids in [assets/scripts/data/seasonalPacks.ts](assets/scripts/data/seasonalPacks.ts).
- Pet/food: [assets/scripts/data/pets.ts](assets/scripts/data/pets.ts), [assets/scripts/data/foods.ts](assets/scripts/data/foods.ts).
- Daily objectives: [assets/scripts/data/dailyObjectives.ts](assets/scripts/data/dailyObjectives.ts). Hub lists whatever is in that catalog.

Do not put item lists in UI scripts. Look up by id from [assets/scripts/data/catalog.ts](assets/scripts/data/catalog.ts).

## Phase 2 limits

- Style and Room are placeholders (data and save already support them).
- No sprite/animation assets yet; keys are reserved.
- Collection is a count line on the Hub, not a full album screen.
