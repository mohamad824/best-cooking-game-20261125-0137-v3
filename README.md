# Ember Hearth — Night Market Kitchen (v3)

[![make.fun](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/competitions/best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/mohamad824/best-cooking-game-20261125-0137-v3/rank.svg)](https://make.fun/competitions/best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/mohamad824/best-cooking-game-20261125-0137-v3/reward.svg)](https://make.fun/competitions/best-cooking-game-20261125-0137)

A real-time action cooking game set in one night-market kitchen. One chef,
one hearth, one rush of hungry customers — cook fast, serve hot.

## How to play

- **Pantry** (left): pick one of six ingredients — meat, pepper, mushroom,
  fish, rice, noodle. Press `1–6` to choose, `E` to grab.
- **Chopping boards**: hold `E` to chop. Bibi, your helper, auto-chops at
  the second board.
- **Ember hearth**: grill on the grills, boil in the pot. Food cooks on its
  own — don't let it wait.
- **Plating counter** (bottom): press `E` with a prepared item to build a
  dish. When the plate matches a recipe it glows READY — pick it up.
- **Serve window** (right): bring a finished plate and press `E` before the
  order's patience runs out.

## Recipes

| Dish | Needs |
| --- | --- |
| Ember Skewer | meat + pepper |
| Mushroom Rice Bowl | rice + mushroom |
| Char Fish Plate | fish + pepper |
| Market Noodle Bowl | noodle + mushroom + pepper |

## Score

100 points per served dish plus a shrinking tip, multiplied by a combo
multiplier (up to x3) that grows with consecutive serves. **WIN at 1000
points. LOSE after 6 walk-outs.**

Three services in a run — Lunch, Evening, and the final **Dinner Rush** —
with orders coming faster and patience getting shorter. Between services,
pick 1 of 3 kitchen upgrades: sharper knives, more patient customers, or
bigger tips.

## Controls

WASD / Arrows — move · E / Space — use a station (hold E to chop) ·
Click — walk to a station · 1–6 — pick a pantry item · Q — scrap the
plate · M — mute.

## Tech

All art is drawn by the game's own canvas code and all sound is synthesised
with WebAudio. Zero network requests. The source is split into files with
one clear job each under `game/js/`.

## What's new in v3

Polish on the proven v2 game — same mechanics, recipes and scoring:

- **No more checkerboard floor**: the kitchen floor is now one continuous
  warm wooden-plank surface with rugs and mats, no repeating grid anywhere.
- **Busy plating strip**: stacked plates, garnish bowls, steam, a second
  dish mid-assembly, utensils and sauce bottles fill the bottom counter.
- **Filled results screen**: the results panel now sits on a warm
  night-market backdrop — hanging lanterns, market stalls, crowd
  silhouettes.

Play it at [make.fun](https://make.fun/competitions/best-cooking-game-20261125-0137).
