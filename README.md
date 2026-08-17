# Pet Haven

Cozy pet-care prototype for **Cocos Creator 3.8.8** + TypeScript. Mobile-first web, portrait 9:16. Design: [pet-casual-cozy-gdd.md](pet-casual-cozy-gdd.md).

This repo currently implements **Phase 1 — Foundation**: catalogs, domain rules, save/load, and a debug HUD. Hub UI, mini-games, Style/Room overlays, and art come in later phases.

## Assumptions

- Engine: Cocos Creator 3.8.8, 2D, web preview.
- No backend, login, payment, gacha, or multiplayer.
- Pet never dies. Stats stay in `0..100`. Offline decay is slow and capped.
- Cosmetic/furniture content is data-driven. UI must read catalogs, not hard-coded item lists.
- Missing art is OK: Phase 1 uses labels and colored buttons. Keep `assetKey` values stable when replacing placeholders later.
- Save key: `pet-haven-save` in `sys.localStorage`.

## Architecture

```text
assets/scripts/
  data/          catalogs and first-run seed
  domain/        types, clamp/decay, feed rewards, equip/room checks
  services/      GameStateService, SaveService, ClockService
  events/        typed EventBus (pet/inventory/currency/room only)
  ui/            GameBootstrap debug HUD (not the real Hub)
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

Starter save: Mochi selected, sailor hat equipped, cozy bed on `floor`, 40 coins, 5 of each food.

## Scene / prefab contract

| Asset | Role |
| --- | --- |
| [assets/scenes/Main.scene](assets/scenes/Main.scene) | Portrait canvas 720×1280 with `GameBootstrap` on Canvas |
| Prefabs | None in Phase 1. HUD is built in code |

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
5. Tap **Feed / Equip / Place / Rest**, then reload the tab. Coins, stats, equipment, and room should remain.

`Dog hoodie` is a compatibility check: it equips on Mochi and is rejected on Miso.

To wipe progress, in the browser console:

```js
localStorage.removeItem('pet-haven-save');
```

## Adding content (no service changes)

- Cosmetic: append a `CosmeticDefinition` in [assets/scripts/data/cosmetics.ts](assets/scripts/data/cosmetics.ts). Use a stable `id` and `assetKey`.
- Furniture: append in [assets/scripts/data/furniture.ts](assets/scripts/data/furniture.ts) and list `allowedAnchors`.
- Seasonal: add ids to the item definitions (`seasonalPackId`) and list those ids in [assets/scripts/data/seasonalPacks.ts](assets/scripts/data/seasonalPacks.ts).
- Pet/food: [assets/scripts/data/pets.ts](assets/scripts/data/pets.ts), [assets/scripts/data/foods.ts](assets/scripts/data/foods.ts).

Do not put item lists in UI scripts. Look up by id from [assets/scripts/data/catalog.ts](assets/scripts/data/catalog.ts).

## Phase 1 limits

- Debug HUD only (no Hub, Style, or Room overlay).
- No sprite/animation assets yet; keys are reserved.
- Play/Clean service APIs exist (`completePlay`, `completeClean`) but have no mini-game UI.
- Daily objectives are tracked in save data; no objective panel yet.
