import { useEffect, useMemo, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import LineChart from './LineChart';
import type { Series } from './LineChart';
import Picker from './Picker';
import { FEED_TYPES, GRAPHS, KIND_LABEL, SUGGESTIONS } from '../data/graphs';
import type { Feed, GNode, NodeKind } from '../data/graphs';
import { MODEL_RANGES, modelLabels, modelPath, windowOf } from '../data/testbox';
import type { ModelRange, Param, TestModel } from '../data/testbox';
import type { AiContext } from '../data/ai';
import { Box, Calendar, Filter, Fx, Left, Pencil, Plus, Send, Spark, SrcDoc, SrcRepo, SrcSheet, Trash } from './Icons';

const COL_W = 186;
const COL_GAP = 66;
const NODE_GAP = 22;
const PAD = 26;

const HEAD_H = 30;
const BODY_PAD = 8;
const ROW_PLAIN = 22;
const ROW_FIELD = 42;

const GLYPH: Record<NodeKind, (p: { size?: number }) => ReactElement> = {
  source: Box,
  input: Filter,
  formula: Fx,
  ai: Spark,
  output: Send,
};

const dollars = (v: number) => `$${v.toFixed(2)}`;
const dollarsAxis = (v: number) => `$${v.toFixed(0)}`;

const EXT: Record<string, string> = { python: 'py', sql: 'sql', excel: 'xlsx', csv: 'csv', api: 'api' };

/* The chips that drop a new block onto the surface. */
const DROPS: { id: string; label: string; kind: NodeKind }[] = [
  { id: 'ai', label: 'AI', kind: 'ai' },
  { id: 'signals', label: 'signals', kind: 'source' },
  { id: 'risk', label: 'risk', kind: 'formula' },
  { id: 'valuation', label: 'valuation', kind: 'formula' },
];

/* ---------------- left track: this model, then the others ---------------- */

export function GraphLeft({
  model,
  models,
  params,
  values,
  range,
  onRange,
  onPick,
  onBack,
}: {
  model: TestModel;
  models: TestModel[];
  params: Param[];
  values: Record<string, number>;
  range: ModelRange;
  onRange: (r: ModelRange) => void;
  onPick: (id: string) => void;
  onBack: () => void;
}) {
  const series: Series[] = useMemo(
    () => [{ key: 'live', label: model.name, data: modelPath(model, params, values, range), color: '#1d7de0', fill: true }],
    [model, params, values, range],
  );
  const labels = useMemo(() => modelLabels(range), [range]);
  const others = models.filter((m) => m.id !== model.id);

  return (
    <div className="graph-left">
      <section className="card panel graph-model">
        <header className="panel-head">
          <div>
            <div className="card-title">Model</div>
            <div className="card-sub">
              {model.name} &middot; {model.on}
            </div>
          </div>
          <button className="icon-btn" onClick={onBack} title="Back to the bench">
            <Left size={14} />
          </button>
        </header>

        <div className="graph-ranges">
          <div className="range">
            {MODEL_RANGES.map((r) => (
              <button key={r} className={`range-b ${r === range ? 'is-on' : ''}`} onClick={() => onRange(r)}>
                {r}
              </button>
            ))}
          </div>
        </div>

        <LineChart labels={labels} series={series} height={142} format={dollars} formatAxis={dollarsAxis} xTicks={4} name="Model graph" />

        <span className="bench-window in-graph">
          <Calendar size={12} />
          <span dangerouslySetInnerHTML={{ __html: windowOf(range) }} />
        </span>
      </section>

      <section className="card panel graph-others">
        <header className="panel-head">
          <div className="card-title">Other models</div>
        </header>
        <div className="panel-body">
          <ul className="runs">
            {others.map((m) => (
              <li key={m.id}>
                <button className="run" onClick={() => onPick(m.id)}>
                  <span className="run-t">
                    <span className="run-n">{m.name}</span>
                    <span className="run-s">{m.on}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

/* ---------------- middle track: the wiring surface ---------------- */

export default function GraphCanvas({ model, onContext }: { model: TestModel; onContext: (c: AiContext | null) => void }) {
  const graph = GRAPHS[model.id];
  const [picked, setPicked] = useState<string | null>(null);
  const [extra, setExtra] = useState<GNode[]>([]);
  const [feed, setFeed] = useState(graph.feeds[0].id);
  const [feeds, setFeeds] = useState<Feed[]>(graph.feeds);
  const [addingFeed, setAddingFeed] = useState(false);

  /* Pan by dragging the surface itself. */
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const [panning, setPanning] = useState(false);

  const nodes = useMemo(() => [...graph.nodes, ...extra], [graph, extra]);

  useEffect(() => {
    const n = picked ? nodes.find((x) => x.id === picked) : null;
    onContext(
      n
        ? {
            id: `${model.id}-${n.id}`,
            kind: 'node',
            title: n.label,
            sub: `${KIND_LABEL[n.kind]} in ${model.name}`,
            questions: [`What feeds ${n.label}?`, `What breaks if ${n.label} is wrong?`, 'Show the source behind this block'],
            actions: [`Re-run downstream of ${n.label}`, `Swap ${n.label} for a peer estimate`, 'Pin this block to the report'],
          }
        : {
            id: `${model.id}-wiring`,
            kind: 'node',
            title: `${model.name} wiring`,
            sub: `${nodes.length} blocks · ${graph.edges.length} connections`,
            cta: { label: 'Generate live model report', note: 'From this wiring and the sources it reads' },
            questions: ['Which block is weakest?', 'What would you change first?', 'Where does the disputed input flow?'],
            actions: ['Trace the disputed input', 'Add a sensitivity block', 'Check every source is fresh'],
          },
    );
  }, [picked, nodes, graph, model, onContext]);

  const laid = useMemo(() => {
    const rowsOf = (n: GNode) => Math.max(n.ins?.length ?? 0, n.outs?.length ?? 0);
    const heights = (n: GNode) => Array.from({ length: rowsOf(n) }, (_, i) => (n.ins?.[i]?.value !== undefined ? ROW_FIELD : ROW_PLAIN));
    const boxes = new Map<string, { x: number; y: number; h: number; rows: number[] }>();

    const cols = [...new Set(nodes.map((n) => n.col))].sort((a, b) => a - b);
    let tallest = 0;
    cols.forEach((c) => {
      let y = PAD;
      nodes
        .filter((n) => n.col === c)
        .sort((a, b) => a.row - b.row)
        .forEach((n) => {
          const rows = heights(n);
          const h = HEAD_H + BODY_PAD * 2 + rows.reduce((s, r) => s + r, 0);
          boxes.set(n.id, { x: PAD + c * (COL_W + COL_GAP), y, h, rows });
          y += h + NODE_GAP;
        });
      tallest = Math.max(tallest, y);
    });

    return { boxes, w: PAD * 2 + cols.length * COL_W + (cols.length - 1) * COL_GAP, h: tallest - NODE_GAP + PAD };
  }, [nodes]);

  function portY(id: string, index: number) {
    const b = laid.boxes.get(id)!;
    const before = b.rows.slice(0, index).reduce((s, r) => s + r, 0);
    return b.y + HEAD_H + BODY_PAD + before + (b.rows[index] ?? ROW_PLAIN) / 2;
  }

  const lit = useMemo(() => {
    if (!picked) return new Set<string>();
    const s = new Set<string>([picked]);
    graph.edges.forEach((e) => {
      if (e.from === picked) s.add(e.to);
      if (e.to === picked) s.add(e.from);
    });
    return s;
  }, [picked, graph]);

  function drop(kind: NodeKind, label: string) {
    const col = Math.max(...nodes.map((n) => n.col));
    setExtra([
      ...extra,
      {
        id: `x-${extra.length}-${label}`,
        label: `${label[0].toUpperCase()}${label.slice(1)} block`,
        kind,
        col: kind === 'source' ? 0 : Math.max(1, col - 1),
        row: 9 + extra.length,
        ins: kind === 'source' ? undefined : [{ label: 'Input' }],
        outs: ['Result'],
      },
    ]);
  }

  const current = feeds.find((f) => f.id === feed) ?? feeds[0];

  return (
    <div className="graph-main">
      <section
        className={`card panel canvas-panel ${panning ? 'is-panning' : ''}`}
        onMouseDown={(e) => {
          if ((e.target as HTMLElement).closest('.gnode')) return;
          drag.current = { x: e.clientX, y: e.clientY, ox: pan.x, oy: pan.y };
          setPanning(true);
        }}
        onMouseMove={(e) => {
          const d = drag.current;
          if (!d) return;
          setPan({ x: d.ox + (e.clientX - d.x), y: d.oy + (e.clientY - d.y) });
        }}
        onMouseUp={() => {
          drag.current = null;
          setPanning(false);
        }}
        onMouseLeave={() => {
          drag.current = null;
          setPanning(false);
        }}
      >
        <div className="canvas-dots">
          <div className="canvas-inner" style={{ width: laid.w, height: laid.h, transform: `translate(${pan.x}px, ${pan.y}px)` }}>
            <svg width={laid.w} height={laid.h} className="wires">
              {graph.edges.map((e) => {
                const a = laid.boxes.get(e.from);
                const b = laid.boxes.get(e.to);
                if (!a || !b) return null;
                const x1 = a.x + COL_W;
                const y1 = portY(e.from, e.fromPort ?? 0);
                const x2 = b.x;
                const y2 = portY(e.to, e.toPort ?? 0);
                const bend = Math.max(34, (x2 - x1) / 2);
                const on = picked !== null && (e.from === picked || e.to === picked);
                return (
                  <path
                    key={`${e.from}${e.fromPort ?? 0}-${e.to}${e.toPort ?? 0}`}
                    d={`M ${x1} ${y1} C ${x1 + bend} ${y1} ${x2 - bend} ${y2} ${x2} ${y2}`}
                    className={`wire ${on ? 'is-on' : ''} ${picked !== null && !on ? 'is-dim' : ''}`}
                  />
                );
              })}
            </svg>

            {nodes.map((n) => {
              const b = laid.boxes.get(n.id)!;
              const dim = picked !== null && !lit.has(n.id);
              const Glyph = GLYPH[n.kind];
              return (
                <div
                  key={n.id}
                  className={`gnode k-${n.kind} ${picked === n.id ? 'is-on' : ''} ${dim ? 'is-dim' : ''}`}
                  style={{ left: b.x, top: b.y, width: COL_W, height: b.h }}
                  onClick={() => setPicked(picked === n.id ? null : n.id)}
                >
                  <div className="gnode-head">
                    <span className="gnode-ic">
                      <Glyph size={12} />
                    </span>
                    <span className="gnode-l">{n.label}</span>
                    <span className="gnode-acts">
                      <button title={`Edit ${n.label}`} onClick={(ev) => ev.stopPropagation()}>
                        <Pencil size={11} />
                      </button>
                      <button
                        title={`Remove ${n.label}`}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          setExtra(extra.filter((x) => x.id !== n.id));
                        }}
                      >
                        <Trash size={11} />
                      </button>
                    </span>
                  </div>

                  <div className="gnode-body">
                    {b.rows.map((h, i) => (
                      <div className="gnode-row" style={{ height: h }} key={i}>
                        <span className="port-side is-in">
                          {n.ins?.[i] && (
                            <>
                              <i className="port" />
                              <span className="port-t">
                                {n.ins[i].label}
                                {n.ins[i].value !== undefined && <em className="port-f">{n.ins[i].value}</em>}
                              </span>
                            </>
                          )}
                        </span>
                        <span className="port-side is-out">
                          {n.outs?.[i] && (
                            <>
                              <span className="port-t">{n.outs[i]}</span>
                              <i className="port" />
                            </>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>

                  <span className="gnode-kind">{KIND_LABEL[n.kind]}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="drops">
        {DROPS.map((d) => (
          <button key={d.id} onClick={() => drop(d.kind, d.label)}>
            <Plus size={11} />
            {d.label}
          </button>
        ))}
        <button className="is-plain" onClick={() => drop('formula', 'block')}>
          <Plus size={11} />
          add
        </button>
      </div>

      <section className="card panel terminal">
        <header className="term-head">
          <div className="term-tabs">
            {feeds.map((f) => (
              <button key={f.id} className={`term-tab ${f.id === feed ? 'is-on' : ''}`} onClick={() => setFeed(f.id)}>
                <FeedGlyph kind={f.kind} />
                {f.name}
              </button>
            ))}
            <div className="term-add">
              <button className="ghost-b" onClick={() => setAddingFeed(!addingFeed)}>
                <Plus size={13} />
                Add
              </button>
              {addingFeed && (
                <Picker
                  items={FEED_TYPES}
                  placeholder="Search source types"
                  onPick={(id) => {
                    const t = FEED_TYPES.find((x) => x.id === id)!;
                    const made: Feed = {
                      id: `${id}-${feeds.length}`,
                      name: `untitled.${EXT[id] ?? id}`,
                      kind: id as Feed['kind'],
                      note: t.sub,
                      body: `# ${t.label} added to ${model.name}\n# nothing wired up yet`,
                    };
                    setFeeds([...feeds, made]);
                    setFeed(made.id);
                    setAddingFeed(false);
                  }}
                  onClose={() => setAddingFeed(false)}
                />
              )}
            </div>
          </div>
          <span className="term-note">{SUGGESTIONS[model.id][0]}</span>
        </header>
        <pre className="term-body">{current.body}</pre>
      </section>
    </div>
  );
}

function FeedGlyph({ kind }: { kind: Feed['kind'] }) {
  if (kind === 'sql' || kind === 'api') return <SrcRepo size={14} />;
  if (kind === 'excel' || kind === 'csv') return <SrcSheet size={14} />;
  return <SrcDoc size={14} />;
}
