# TarkovTools

An unofficial, non-commercial collection of community-built utilities for Escape from Tarkov.

The root URL is the TarkovTools hub. Each utility lives at its own stable route so the repository can grow without turning into one giant page.

## Available tools

### Kord Breach Route Planner

Enter the documents you still need, choose which maps you can access, and the planner ranks the most useful routes against the daily pickup limit. Progress is stored only in the browser.

## Features

- Configurable document targets for a reward, a page, or the whole pass
- 30-document daily limit by default, with a custom limit option
- Multi-raid route optimization that minimizes the number of raids
- Exact document quantities for every map in each suggested route
- Live route recalculation after every pickup
- Map access filters for players who have not unlocked every location
- Direct links to Perofunyang's interactive document maps
- Local-only persistence through `localStorage`
- Responsive desktop and mobile layout

## Local development

Requirements:

- Node.js 22.13 or newer
- npm

```bash
npm ci
npm run dev
```

Create a production build with:

```bash
npm run build
```

The production build creates a static export in `out/`. The Cloudflare Worker build remains available through `npm run build:worker`.

## Live site

The `main` branch is deployed automatically to GitHub Pages:

<https://pinchitos.github.io/TarkovTools/>

Direct link to the Kord Breach planner:

<https://pinchitos.github.io/TarkovTools/kord-breach-planner/>

## Privacy

The planner has no accounts, analytics, cookies, or server-side database. Targets, available maps, and the current daily limit are saved locally in the visitor's browser.

## Credits

- Interactive document map links point to [Perofunyang's Battle Pass Interactive Map](https://github.com/Perofunyang/battlepass_interactive_map), which is a separate third-party project.
- The off-duty link points to [Pachangas](https://www.pachangasapp.com/), a separate third-party service available in Spain.
- Escape from Tarkov is developed and published by [Battlestate Games](https://www.escapefromtarkov.com/).

## Legal notice

TarkovTools is an unofficial, non-commercial fan-made project. It is not affiliated with, sponsored by, or endorsed by Battlestate Games.

Escape from Tarkov, its name, trademarks, document artwork, and other game assets are the property of Battlestate Games and/or their respective rights holders. The in-game document images included here are used only to identify gameplay items and are not licensed for reuse under this repository's source-code license.

This project links to external websites but does not incorporate, mirror, or redistribute their code, maps, or services. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for details.

## License

The original source code is available under the [MIT License](LICENSE.md). Third-party trademarks and game assets are explicitly excluded from that license.
