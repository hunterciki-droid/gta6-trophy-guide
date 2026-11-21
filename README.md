![GTA 6 Trophy Guide](https://make.fun/badge/gta6-trophy-guide-01.svg)
![Rank](https://make.fun/badge/gta6-trophy-guide-01/hunterciki-droid/gta6-trophy-guide/rank.svg)
![Reward](https://make.fun/badge/gta6-trophy-guide-01/hunterciki-droid/gta6-trophy-guide/reward.svg)

# GTA 6 Trophy Guide & Tracker

An offline guide and tracker for all 55 Grand Theft Auto VI trophies on PlayStation 5 — every trophy with its official name, description and grade, a cited guide in our own words, a roadmap to the platinum, one flagged missable trophy, and a checklist that saves in the browser. Built for the [gta6-trophy-guide-01 bounty](https://make.fun/bounty/gta6-trophy-guide-01) on make.fun.

## Run it locally

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no network at runtime: `app/` is plain static files (`index.html`, `app.js`, `style.css`, `data/trophies.json`).

## What it does

- **Checklist** — tick trophies off; progress (`X / 55` plus a percentage and per-grade counts) saves in `localStorage`.
- **Export / import** — download your progress as JSON and import it back on any machine.
- **Filters** — by kind (story, collectibles, activities, missable, other, online), by earned/unearned, plus free-text search.
- **Spoiler setting** — hides the names and descriptions of story trophies until you earn them.
- **Roadmap to the platinum** — three stages (story ~60–80 hrs, 100% checklist ~100 hrs, cleanup ~10 hrs) built from the official descriptions, with the chapter and mission order, collectible counts, and the one potentially missable trophy flagged.
- **Cited guides** — every trophy's guide names its sources (PowerPyx, GTABase, Push Square, KeenGamer, games.gg, GTA Zone, EGamers, Insider Gaming). Where no public source has confirmed a method yet, the guide says so instead of guessing.

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
# out/ holds app/, screenshots/ and dossier.json
```

---

Built with [make.fun](https://make.fun/r/tc0h9t5n) — referral code `tc0h9t5n`.
