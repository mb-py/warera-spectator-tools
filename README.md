# The Spectator — WarEra Spectator Tools

A small set of browser-based calculators for [**WarEra**](https://warera.io), a
persistent browser-based game (PBBG) of geopolitics, war and economy. The tools
help a manufacturer or region-owner answer questions like *"does this factory
actually make money?"* and *"where do my workers earn the most?"*

**▶ Live site: <https://mb-py.github.io/warera-spectator-tools/>**

They run entirely in the browser — no account, no login, nothing to install —
and pull live WarEra market prices and region data that are refreshed
automatically several times a day.

> Unofficial fan project. Not affiliated with, endorsed by, or connected to the
> WarEra team.

---

## The tools

### I. Production Cost Studio

Work out what it costs to produce one unit of a manufactured good, and compare
regions side by side.

- Pick a good (Concrete, Steel, Paper, Oil, Bread, Steak, Cooked Fish, the Ammo
  tiers, Pill).
- Set a range for the raw-material price, the sale price, your target **net
  wage**, and a **worker fidelity** range (1–10%).
- Add as many regions as you like, each with its **income tax %** and
  **production bonus %**.

The chart draws every region as a shaded band: the top edge is low fidelity
(most expensive), the bottom edge is full fidelity (cheapest). The dashed line is
the sell price — any band sitting below it is in profit. The table underneath
gives each region's average cost, net benefit, cost range, and the raw-material
price at which it breaks even (higher = more headroom).

It's just as useful from the other side of the table. A player government can
use it to set a **competitive tax rate and production bonus** for their
country's specialty good — benchmarking their current or planned numbers against
the tax and bonus of rival nations to see whose factories actually come out
ahead.

Picking a raw resource instead of a manufactured good switches the chart to a
compact per-region "dumbbell" comparison.

### II. Worker Yield Analysis

Ranks where a worker's production point returns the most value, across every
resource and every region that specialises in it.

- **All Resources** view: one line per resource (its best region), plus a
  sortable table of the best region at 1% and at 10% fidelity.
- **Resource Analysis** view: a single resource across the full 1–10% fidelity
  curve, with break-even fidelity per region.
- Set your wage as **net or gross**; override any individual market price in the
  sidebar (your overrides are remembered for a day and cleared automatically when
  fresh prices land).
- **Open in PCS →** hands the current resource and regions straight to the
  Production Cost Studio.

Region bonuses and deposit/specialty data here come from a static snapshot and
can lag behind the live game — treat this tool as a guide, not gospel.

### Shared features

Every tool has:

- **Copy share link** — encodes the whole scenario in the URL (only the values
  you changed, so links stay short).
- **Copy view-only link** — same, but opens in a stripped-down read-only layout.
- **Copy to clipboard (PNG)** — renders the chart card as an image.

---

## A note on naming

WarEra's public website and app call two resources **"Medicinal Plant"** and
**"Pill"**. WarEra's own API and data feed still use the original internal names
`coca` and `cocain`. These tools show the public names everywhere in the
interface but keep the internal keys in the data and in share links, so
everything stays compatible. The translation lives in `frontLabel()` in
`spectator-utils.js`.

To be clear, these are fictional crafting materials in a strategy game — in the
same bucket as its "Concrete", "Livestock" and "Ammo" — and the tool only does
arithmetic on in-game market numbers.

---

## For developers

### How it's built

Plain HTML, CSS and JavaScript. **No framework, no build step, no bundler** —
each tool is a single self-contained `.html` file you can open directly.

| File | Purpose |
| --- | --- |
| `index.html` | Landing page / tool directory |
| `production_cost_studio.html` | Tool I (self-contained) |
| `worker_yield_analysis.html` | Tool II (self-contained) |
| `spectator-utils.js` | Shared helpers: clipboard, date formatting, the symlog chart scale, the dumbbell Chart.js plugin, and `frontLabel()` |
| `spectator.css` | Shared "newspaper" theme |
| `favicon.svg` | Icon |

External dependencies are loaded from a CDN at runtime: **Chart.js 4.4.1** and
**html2canvas 1.4.1** from cdnjs, plus Google Fonts (Playfair Display, Source
Serif 4, IBM Plex Mono).

### Data files

These are generated automatically — don't hand-edit them.

| File | Contents |
| --- | --- |
| `prices.json` | Live market micro-prices (BTC) per item, plus `_updated` (ISO timestamp) and `_netWage` (the server's default net wage; tools fall back to `0.120` if it's missing) |
| `regions.json` | Per-region economy snapshot: income tax, total production bonus, resource specialty, country/region names |
| `resources.json` | Static recipe definitions: internal key, display name, `type` (`mfg` or `raw`), input resource, raw units per craft, and production points (`pp`) |

### How the prices are derived

`prices.json` does **not** come from the WarEra API's `getPrices` endpoint. That
figure trails the live market and, often enough, sits *outside* the current
bid/ask spread — which makes it unsafe to plan costs against.

Instead each price is calculated as a point **inside** the spread, weighted by
the volume of the **100 nearest unfulfilled buy and sell orders** on the order
book. If you fork this and build your own exporter, do something equivalent
rather than trusting `getPrices`.

### Where the data comes from

The data-collection pipeline is deliberately **not part of this project**. This
repo is only the front-end plus a committed snapshot of `prices.json` /
`regions.json`; the author keeps a private job that refreshes those files and
pushes them as `Automated data update <timestamp> [skip ci]` commits.

The tools fetch the JSON at runtime **directly from
`raw.githubusercontent.com/.../main/`** rather than from their own origin, so new
data appears without waiting for a GitHub Pages rebuild. The whole thing is meant
to be forked and pointed at whatever data source you maintain with your own
tools.

### Running or forking it

Because the tools fetch data from an absolute `raw.githubusercontent.com` URL,
you can just open the HTML files locally (or serve the folder with any static
server) and they'll pull live data from the published repo.

To run it as your own:

1. Fork the repo and enable **GitHub Pages** on the `main` branch.
2. Update the `DATA_BASE` constant near the bottom of
   `production_cost_studio.html` and `worker_yield_analysis.html` to point at
   your fork's raw URL (or `'./'` to load `prices.json` / `regions.json` from the
   same folder).
3. Supply your own `prices.json` and `regions.json`, or wire up your own export
   job to keep them fresh.

---

## License

Released into the **public domain** under [The Unlicense](LICENSE) — a
widely-used, GitHub-recognised public-domain dedication. Copy it, modify it,
fork it, republish it, sell it; no attribution required, no warranty of any
kind. This is a throwaway, largely AI-generated set of tools — it belongs to
everyone.