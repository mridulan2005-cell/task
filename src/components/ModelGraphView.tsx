import { useMemo, useState } from 'react';
import LineChart from './LineChart';
import type { Series } from './LineChart';
import Picker from './Picker';
import { FEED_TYPES, GRAPHS, SUGGESTIONS } from '../data/graphs';
import type { Feed, GNode } from '../data/graphs';
import { MODEL_RANGES, modelLabels, modelPath, windowOf } from '../data/testbox';
import type { ModelRange, Param, TestModel } from '../data/testbox';
import { Calendar, Chevron, Plus, Send, Spark, SrcDoc, SrcRepo, SrcSheet } from './Icons';

const COL_W = 168;
const COL_GAP = 56;
const ROW_H = 58;
const ROW_GAP = 16;
const PAD = 18;

const NODE_W = 168;
const NODE_H = 52;

const KIND_LABEL: Record<string, string> = {
  source: 'Source',
  assumption: 'Input',
  transform: 'Step',
  output: 'Output',
};

const dollars = (v: number) => `$${v.toFixed(2)}`;
const dollarsAxis = (v: number) => `$${v.toFixed(0)}`;

const EXT: Record<string, string> = { python: 'py', sql: 'sql', excel: 'xlsx', csv: 'csv', api: 'api' };

const at = (n: GNode) => ({ x: PAD + n.col * (COL_W + COL_GAP), y: PAD + n.row * (ROW_H + ROW_GAP) });

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

  const size = useMemo(() => {
    const cols = Math.max(...graph.nodes.map((n) => n.col)) + 1;
    const rows = Math.max(...graph.nodes.map((n) => n.row)) + 1;
    return { w: PAD * 2 + cols * COL_W + (cols - 1) * COL_GAP, h: PAD * 2 + rows * ROW_H + (rows - 1) * ROW_GAP };
  }, [graph]);

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
          <div className="canvas-inner" style={{ width: size.w, height: size.h }}>
            <svg width={size.w} height={size.h} className="wires">
              {graph.edges.map((e) => {
                const a = graph.nodes.find((n) => n.id === e.from)!;
                const b = graph.nodes.find((n) => n.id === e.to)!;
                const p1 = at(a);
                const p2 = at(b);
                const x1 = p1.x + NODE_W;
                const y1 = p1.y + NODE_H / 2;
                const x2 = p2.x;
                const y2 = p2.y + NODE_H / 2;
                const bend = Math.max(28, (x2 - x1) / 2);
                const on = picked && (e.from === picked || e.to === picked);
                return (
                  <path
                    key={`${e.from}-${e.to}`}
                    d={`M ${x1} ${y1} C ${x1 + bend} ${y1} ${x2 - bend} ${y2} ${x2} ${y2}`}
                    className={`wire ${on ? 'is-on' : ''} ${picked && !on ? 'is-dim' : ''}`}
                  />
                );
              })}
            </svg>

            {graph.nodes.map((n) => {
              const p = at(n);
              const dim = picked !== null && !lit.has(n.id);
              return (
                <button
                  key={n.id}
                  className={`gnode k-${n.kind} ${picked === n.id ? 'is-on' : ''} ${dim ? 'is-dim' : ''}`}
                  style={{ left: p.x, top: p.y, width: NODE_W, height: NODE_H }}
                  onClick={() => setPicked(picked === n.id ? null : n.id)}
                >
                  <span className="gnode-k">{KIND_LABEL[n.kind]}</span>
                  <span className="gnode-l">{n.label}</span>
                  <span className="gnode-d">{n.detail}</span>
                </button>
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
                  graph.nodes.filter((n) => n.kind === 'transform').length
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
