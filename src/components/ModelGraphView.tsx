import { useMemo, useState } from 'react';
import type { ReactElement } from 'react';
import LineChart from './LineChart';
import type { Series } from './LineChart';
import Picker from './Picker';
import { FEED_TYPES, GRAPHS, KIND_LABEL, SUGGESTIONS } from '../data/graphs';
import type { Feed, GNode, NodeKind } from '../data/graphs';
import { MODEL_RANGES, modelLabels, modelPath, windowOf } from '../data/testbox';
import type { ModelRange, Param, TestModel } from '../data/testbox';
import { Box, Calendar, Chevron, Filter, Fx, Pencil, Plus, Send, Spark, SrcDoc, SrcRepo, SrcSheet, Trash } from './Icons';

const COL_W = 186;
const COL_GAP = 62;
const NODE_GAP = 20;
const PAD = 18;

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

export default function ModelGraphView({
  model,
  params,
  values,
  range,
  onRange,
  onBack,
}: {
  model: TestModel;
  params: Param[];
  values: Record<string, number>;
  range: ModelRange;
  onRange: (r: ModelRange) => void;
  onBack: () => void;
}) {
  const graph = GRAPHS[model.id];
  const [picked, setPicked] = useState<string | null>(null);
  const [feed, setFeed] = useState(graph.feeds[0].id);
  const [addingFeed, setAddingFeed] = useState(false);
  const [feeds, setFeeds] = useState<Feed[]>(graph.feeds);

  /* Nodes size themselves from their ports, then stack down each column. */
  const laid = useMemo(() => {
    const rowsOf = (n: GNode) => Math.max(n.ins?.length ?? 0, n.outs?.length ?? 0);
    const heights = (n: GNode) =>
      Array.from({ length: rowsOf(n) }, (_, i) => (n.ins?.[i]?.value !== undefined ? ROW_FIELD : ROW_PLAIN));
    const boxes = new Map<string, { x: number; y: number; h: number; rows: number[] }>();

    const cols = [...new Set(graph.nodes.map((n) => n.col))].sort((a, b) => a - b);
    let tallest = 0;
    cols.forEach((c) => {
      let y = PAD;
      graph.nodes
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

    return {
      boxes,
      w: PAD * 2 + cols.length * COL_W + (cols.length - 1) * COL_GAP,
      h: tallest - NODE_GAP + PAD,
    };
  }, [graph]);

  /* A port sits at the middle of its row, on the edge of the node. */
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

  const series: Series[] = useMemo(
    () => [{ key: 'live', label: model.name, data: modelPath(model, params, values, range), color: '#1d7de0', fill: true }],
    [model, params, values, range],
  );
  const labels = useMemo(() => modelLabels(range), [range]);

  const current = feeds.find((f) => f.id === feed) ?? feeds[0];

  return (
    <div className="graphview">
      <section className="card panel canvas-panel">
        <header className="panel-head">
          <div>
            <div className="card-title">{model.name}</div>
            <div className="card-sub">
              {model.on} &middot; {graph.nodes.length} nodes &middot; {graph.edges.length} connections
            </div>
          </div>
          <button className="ghost-b" onClick={onBack}>
            Back to the bench
          </button>
        </header>

        <div className="canvas-scroll">
          <div className="canvas-inner" style={{ width: laid.w, height: laid.h }}>
            <svg width={laid.w} height={laid.h} className="wires">
              {graph.edges.map((e) => {
                const a = laid.boxes.get(e.from)!;
                const b = laid.boxes.get(e.to)!;
                const x1 = a.x + COL_W;
                const y1 = portY(e.from, e.fromPort ?? 0);
                const x2 = b.x;
                const y2 = portY(e.to, e.toPort ?? 0);
                const bend = Math.max(30, (x2 - x1) / 2);
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

            {graph.nodes.map((n) => {
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
                      <button title={`Remove ${n.label}`} onClick={(ev) => ev.stopPropagation()}>
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
          <span className="term-note">{current.note}</span>
        </header>
        <pre className="term-body">{current.body}</pre>
      </section>

      <section className="card panel graph-model">
        <header className="panel-head">
          <div>
            <div className="card-title">Model</div>
            <div className="card-sub">{model.on}</div>
          </div>
          <button className="icon-btn" onClick={onBack} title="Open the full bench">
            <Chevron size={14} className="crumb-sep" />
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

        <LineChart labels={labels} series={series} height={150} format={dollars} formatAxis={dollarsAxis} xTicks={4} />

        <span className="bench-window in-graph">
          <Calendar size={12} />
          <span dangerouslySetInnerHTML={{ __html: windowOf(range) }} />
        </span>
      </section>

      <section className="card panel graph-ai">
        <header className="panel-head">
          <div className="card-title">
            <Spark size={14} />
            AI chat
          </div>
        </header>

        <div className="panel-body">
          <p className="gai-msg">
            {picked
              ? `${graph.nodes.find((n) => n.id === picked)!.label} feeds ${
                  graph.edges.filter((e) => e.from === picked).length
                } step${graph.edges.filter((e) => e.from === picked).length === 1 ? '' : 's'} downstream. Changing it moves the output.`
              : `This model runs ${graph.nodes.filter((n) => n.kind === 'source').length} sources through ${
                  graph.nodes.filter((n) => n.kind === 'formula').length
                } steps. The weakest link is the disputed input.`}
          </p>

          <div className="block-h as-label">Suggested</div>
          <ul className="gai-actions">
            {SUGGESTIONS[model.id].map((s) => (
              <li key={s}>
                <button>
                  <span>{s}</span>
                  <span className="next-go">
                    <Send size={12} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="ai-compose">
          <input placeholder="Ask about this model" />
          <button className="ai-send" title="Send">
            <Send />
          </button>
        </div>
      </section>
    </div>
  );
}

function FeedGlyph({ kind }: { kind: Feed['kind'] }) {
  if (kind === 'sql' || kind === 'api') return <SrcRepo size={14} />;
  if (kind === 'excel' || kind === 'csv') return <SrcSheet size={14} />;
  return <SrcDoc size={14} />;
}
