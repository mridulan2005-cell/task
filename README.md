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

The third is `#risk`. Roles can also be switched from the user chip in the top right.

## Layout

Every role uses the same three panels. On the left, navigation over the lists
that role keeps at hand. In the middle, the work. On the right, the copilot,
which is always present rather than something to open.

## Surfaces

**Portfolio manager.** A row of metric tiles that can be swapped or extended,
a performance chart comparing the book against benchmarks, positions,
transactions and limit monitors, asset allocation, the attention queue, top
investment signals and the proposals waiting on a decision.

**Analyst.** Research backup and idea generation share one surface, beside
running models, saved templates and the analyst's own attention queue.

**Risk analyst.** Coverage counts across the top, then the exceptions the agent
cannot clear alone, current risk against its limits, what was prevented today,
recent agent activity, a worked evaluation and the continuous simulation.

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
