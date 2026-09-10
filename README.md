# RISE

Workspace for an agentically run investment fund. Two roles share one shell: a
portfolio manager who approves what the agents propose, and an analyst who
generates ideas and tests models before sending a proposal up.

## Running it

```bash
npm install
npm run dev
```

The app opens on `http://localhost:5177`. Two deep links skip the role switch:

- `#analyst` opens the analyst workspace
- `#testbox` opens the model testbox

Roles can also be switched from the user chip in the top right.

## Surfaces

**Portfolio manager.** A row of metric tiles that can be swapped or extended,
a performance chart comparing the book against benchmarks, positions,
transactions and limit monitors, asset allocation, the attention queue, and a
watchlist.

**Analyst.** Research backup and idea generation share one surface. The right
column carries running models and the analyst's own attention queue.

**Model testbox.** Reached from the analyst workspace. Selected models stack on
the bench, each with its own range switcher, price chart and parameter sliders.
The report on the right rewrites itself as parameters move, and the proposal at
the bottom goes to the portfolio manager.

## What is real and what is simulated

Every number is generated, not fetched. Price paths use Geometric Brownian
Motion with Box-Muller shocks from a seeded generator, so a redraw reproduces
the same market rather than reshuffling it. The portfolio chart drives all its
series from one shared market shock stream, blended per series as
`corr × market + √(1−corr²) × own`, so the lines move together without being
identical.

## Layout

```
src/
  components/   one file per surface or control
  data/         generated series, catalogues and copy
  app.css       every layout and component style
  index.css     design tokens
```

Charts are Chart.js. Everything else is hand-built.
