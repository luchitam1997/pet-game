# Pet Haven

Cozy pet-care prototype for **Cocos Creator 3.8.8** + TypeScript. Mobile-first web, portrait 9:16. Design: [pet-casual-cozy-gdd.md](pet-casual-cozy-gdd.md).

**MVP is playable:** choose a pet, care (Feed / Clean / Play / Rest), earn coins, equip cosmetics, place furniture. Style/Room read catalogs; adding an item does not require service changes.

## Assumptions

- Engine: Cocos Creator 3.8.8, 2D, web preview.
- No backend, login, payment, gacha, or multiplayer.
- Pet never dies. Stats stay in `0..100`. Offline decay is slow and capped.
- Cosmetic/furniture content is data-driven. UI must read catalogs, not hard-coded item lists.
- Missing art is OK: placeholders are colored shapes and labels. Keep `assetKey` values stable when you drop in SpriteFrames later.
- Save key: `pet-haven-save` in `sys.localStorage`.
- New saves start with no pet selected. A save that already has a pet loads into the Hub.

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
| Style slots (MVP UI) | 3 | `head`, `neck`, `body` (catalog also has `back`, `face`, `paw`) |

Starter inventory: 5 of each food, sailor hat + bandana + hoodie owned, cozy bed + plant owned, 40 coins. Mochi starts with the sailor hat equipped; bed is on `floor`.

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

Replace a placeholder later by mapping `assetKey` (for example `cosmetic/sailor_hat`) to a SpriteFrame or Prefab of the same key. Do not rename ids.

## How to run

1. Open this folder in **Cocos Creator 3.8.8**.
2. Wait until assets finish importing.
3. Open `assets/scenes/Main.scene`.
4. Click **Preview** (browser). Use a 9:16 device preset if available.

New-player path (under two minutes):

1. Choose Mochi or Miso.
2. Feed a favorite food, finish a 3-step bath, play the tap game, or Rest.
3. Open **Style**, equip or buy a look (wrong species shows toast and does not equip).
4. Open **Room**, select an anchor, place owned furniture (invalid anchors are rejected; placing on an occupied anchor replaces).
5. Reload the tab — pet, coins, equipment, and room remain.

Play is a 20–60s tap game (ball for dog, spark for cat). Clean is rinse → scrub → dry. Rest disables when energy is 90+. Tap the collection line on the Hub for owned vs locked items.

To wipe progress:

```js
localStorage.removeItem('pet-haven-save');
```

## Adding content (no service or UI list changes)

- Cosmetic: append a `CosmeticDefinition` in [assets/scripts/data/cosmetics.ts](assets/scripts/data/cosmetics.ts) with a stable `id`, `slot`, `species`, `assetKey`, and optional `priceCoins` / `seasonalPackId`.
- Furniture: append in [assets/scripts/data/furniture.ts](assets/scripts/data/furniture.ts) with `allowedAnchors` and `assetKey`.
- Seasonal: set `seasonalPackId` on items and list those ids in [assets/scripts/data/seasonalPacks.ts](assets/scripts/data/seasonalPacks.ts).
- Pet/food: [assets/scripts/data/pets.ts](assets/scripts/data/pets.ts), [assets/scripts/data/foods.ts](assets/scripts/data/foods.ts).
- Daily objectives: [assets/scripts/data/dailyObjectives.ts](assets/scripts/data/dailyObjectives.ts). Hub and Style/Room iterate the catalogs.

Do not put item lists in UI scripts. Look up by id from [assets/scripts/data/catalog.ts](assets/scripts/data/catalog.ts).

## MVP limits

- Placeholder art only (no SpriteFrame swap wired yet; keys are reserved).
- Collection is a catalog checklist, not a photo album.
- Face/back/paw cosmetics exist in data; Style filters highlight head/neck/body first.
- No real payments, ads, or cloud save.
