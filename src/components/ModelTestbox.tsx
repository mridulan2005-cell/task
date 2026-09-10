import { useMemo, useState } from 'react';
import LineChart from './LineChart';
import type { Series } from './LineChart';
import Picker from './Picker';
import ModelGraphView from './ModelGraphView';
import { Handle, useColumns } from './Resizer';
import { FORMATS, MODELS, MODEL_RANGES, defaults, modelLabels, modelPath, outcome, windowOf } from '../data/testbox';
import type { ModelRange, Param, TestModel } from '../data/testbox';
import { Box, Calendar, Check, Chevron, Nodes, Pencil, Plus, Send, Spark, SrcDoc } from './Icons';

type State = { params: Param[]; values: Record<string, number>; range: ModelRange };

const dollars = (v: number) => `$${v.toFixed(2)}`;
const dollarsAxis = (v: number) => `$${v.toFixed(0)}`;

export default function ModelTestbox({ onGraph }: { onGraph: (name: string | null) => void }) {
  const cols = useColumns({ min: 190, max: 340, start: 216 }, { min: 260, max: 440, start: 310 });

  const [on, setOn] = useState<string[]>(MODELS.map((m) => m.id));
  const [state, setState] = useState<Record<string, State>>(() => {
    const out: Record<string, State> = {};
    MODELS.forEach((m) => (out[m.id] = { params: m.params, values: defaults(m), range: '1Y' }));
    return out;
  });
  const [adding, setAdding] = useState<string | null>(null);
  const [graph, setGraph] = useState<string | null>(null);

  const shown = MODELS.filter((m) => on.includes(m.id));
  const wired = MODELS.find((m) => m.id === graph);

  function openGraph(id: string | null) {
    setGraph(id);
    onGraph(id ? MODELS.find((m) => m.id === id)!.name : null);
  }

  function setValue(id: string, pid: string, v: number) {
    setState((s) => ({ ...s, [id]: { ...s[id], values: { ...s[id].values, [pid]: v } } }));
  }

  function addParam(id: string, pid: string) {
    const m = MODELS.find((x) => x.id === id)!;
    const p = m.extra.find((x) => x.id === pid)!;
    setState((s) => ({ ...s, [id]: { ...s[id], params: [...s[id].params, p], values: { ...s[id].values, [p.id]: p.def } } }));
    setAdding(null);
  }

  function setRange(id: string, range: ModelRange) {
    setState((s) => ({ ...s, [id]: { ...s[id], range } }));
  }

  function reset(id: string) {
    const m = MODELS.find((x) => x.id === id)!;
    setState((s) => ({ ...s, [id]: { ...s[id], params: m.params, values: defaults(m) } }));
  }

  return (
    <main className={`testbox ${wired ? 'is-wired' : ''}`} style={{ gridTemplateColumns: wired ? `${cols.l}px 6px minmax(0, 1fr)` : cols.template }}>
      <section className="card panel runlist">
        <header className="panel-head">
          <div>
            <div className="card-title">Models running</div>
            <div className="card-sub">
              {shown.length} of {MODELS.length} shown
            </div>
          </div>
        </header>

        <div className="panel-body">
          <ul className="runs">
            {MODELS.map((m) => {
              const picked = on.includes(m.id);
              const out = outcome(m, state[m.id].params, state[m.id].values, state[m.id].range);
              return (
                <li key={m.id}>
                  <button
                    className={`run ${picked ? 'is-on' : ''}`}
                    onClick={() => setOn(picked ? on.filter((x) => x !== m.id) : [...on, m.id])}
                  >
                    <span className="run-box">{picked ? <Check size={12} /> : <Box size={14} />}</span>
                    <span className="run-t">
                      <span className="run-n">{m.name}</span>
                      <span className="run-s">{m.on}</span>
                    </span>
                    <span className={`run-out ${out >= 0 ? 'up' : 'down'}`}>
                      {out >= 0 ? '+' : ''}
                      {out.toFixed(1)}%
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <footer className="panel-foot">
          <button className="btn-dark wide">
            <Spark size={13} />
            Create
          </button>
        </footer>
      </section>

      <Handle onDown={cols.start('l')} label="Resize the model list" />

      {wired ? (
        <ModelGraphView
          model={wired}
          params={state[wired.id].params}
          values={state[wired.id].values}
          range={state[wired.id].range}
          onRange={(r) => setRange(wired.id, r)}
          onBack={() => openGraph(null)}
        />
      ) : (
      <div className="testbox-mid">
        {shown.map((m) => (
          <ModelCard
            key={m.id}
            model={m}
            state={state[m.id]}
            adding={adding === m.id}
            onAdd={() => setAdding(adding === m.id ? null : m.id)}
            onAddParam={(pid) => addParam(m.id, pid)}
            onCloseAdd={() => setAdding(null)}
            onValue={(pid, v) => setValue(m.id, pid, v)}
            onRange={(r) => setRange(m.id, r)}
            onOpenGraph={() => openGraph(m.id)}
            onReset={() => reset(m.id)}
          />
        ))}
        {shown.length === 0 && (
          <section className="card panel">
            <div className="empty">
              <strong>Nothing selected.</strong>
              <span>Tick a model on the left to bring it onto the bench.</span>
            </div>
          </section>
        )}
      </div>
      )}

      {!wired && <Handle onDown={cols.start('r')} label="Resize the report" />}

      {!wired && <LiveReport shown={shown} state={state} />}
    </main>
  );
}

/* ---------------- one model on the bench ---------------- */

function ModelCard({
  model,
  state,
  adding,
  onAdd,
  onAddParam,
  onCloseAdd,
  onValue,
  onRange,
  onOpenGraph,
  onReset,
}: {
  model: TestModel;
  state: State;
  adding: boolean;
  onAdd: () => void;
  onAddParam: (pid: string) => void;
  onCloseAdd: () => void;
  onValue: (pid: string, v: number) => void;
  onRange: (r: ModelRange) => void;
  onOpenGraph: () => void;
  onReset: () => void;
}) {
  const series: Series[] = useMemo(
    () => [{ key: 'live', label: model.name, data: modelPath(model, state.params, state.values, state.range), color: '#1d7de0', fill: true }],
    [model, state],
  );
  const labels = useMemo(() => modelLabels(state.range), [state.range]);
  const [scrub, setScrub] = useState<string | null>(null);

  const moved = state.params.some((p) => (state.values[p.id] ?? p.def) !== p.def);
  const free = model.extra.filter((e) => !state.params.some((p) => p.id === e.id));

  return (
    <section className="card bench" onDoubleClick={onOpenGraph}>
      <header className="bench-head">
        <div>
          <div className="card-title">{model.name}</div>
          <div className="card-sub">
            {model.on} &middot; {model.summary}
          </div>
        </div>
        <div className="bench-tools">
          {moved && (
            <button className="ghost-b" onClick={onReset}>
              Reset
            </button>
          )}
          <button className="node-btn" onClick={onOpenGraph} title="Open the model wiring">
            <Nodes size={15} />
          </button>
        </div>
      </header>

      <div className="bench-ranges">
        <div className="range">
          {MODEL_RANGES.map((r) => (
            <button key={r} className={`range-b ${r === state.range ? 'is-on' : ''}`} onClick={() => onRange(r)}>
              {r}
            </button>
          ))}
        </div>
        <span className="bench-window">
          <Calendar size={13} />
          <span dangerouslySetInnerHTML={{ __html: windowOf(state.range) }} />
        </span>
      </div>

      <div className="bench-chart">
        <LineChart labels={labels} series={series} height={176} format={dollars} formatAxis={dollarsAxis} xTicks={6} />
      </div>

      <div className="bench-params">
        <div className="block-h as-label">Parameters</div>
        <ul>
          {state.params.map((p) => {
            const v = state.values[p.id] ?? p.def;
            const pos = ((v - p.min) / (p.max - p.min)) * 100;
            return (
              <li key={p.id}>
                <span className="param-top">
                  <span className="param-l">{p.label}</span>
                  <span className={`param-v ${v !== p.def ? 'is-moved' : ''}`}>
                    {v}
                    {p.unit && <em>{p.unit}</em>}
                  </span>
                </span>
                <span className="param-slider">
                  <input
                    type="range"
                    min={p.min}
                    max={p.max}
                    step={p.step}
                    value={v}
                    onChange={(e) => onValue(p.id, +e.target.value)}
                    onPointerEnter={() => setScrub(p.id)}
                    onPointerDown={() => setScrub(p.id)}

                    onPointerLeave={() => setScrub(null)}
                    onFocus={() => setScrub(p.id)}
                    onBlur={() => setScrub(null)}
                    style={{ backgroundSize: `${pos}% 100%` }}
                  />
                  {/* the bubble rides the thumb, inset so it never leaves the track */}
                  <span className={`param-bubble ${scrub === p.id ? 'is-on' : ''}`} style={{ left: `calc(${pos}% + ${7 - pos * 0.14}px)` }}>
                    {v}
                    {p.unit && <em>{p.unit}</em>}
                  </span>
                  <span className="param-ends">
                    <em>{p.min}</em>
                    <em>{p.max}</em>
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <footer className="bench-foot">
        <span className="bench-note">{model.line(state.values)}</span>
        <div className="bench-add">
          <button className="ghost-b" onClick={onAdd} disabled={free.length === 0}>
            <Plus size={13} />
            Add
          </button>
          {adding && free.length > 0 && (
            <Picker
              items={free.map((f) => ({ id: f.id, label: f.label, sub: `${f.min} to ${f.max}${f.unit}` }))}
              placeholder="Search variables"
              align="right"
              onPick={onAddParam}
              onClose={onCloseAdd}
            />
          )}
        </div>
      </footer>
    </section>
  );
}

/* ---------------- right: live model report ---------------- */

function LiveReport({ shown, state }: { shown: TestModel[]; state: Record<string, State> }) {
  const [edit, setEdit] = useState<string | null>(null);
  const [text, setText] = useState<Record<string, string>>({});
  const [format, setFormat] = useState('memo');
  const [picking, setPicking] = useState(false);
  const [sent, setSent] = useState(false);

  const fmt = FORMATS.find((f) => f.id === format)!;

  const best = shown
    .map((m) => ({ m, out: outcome(m, state[m.id].params, state[m.id].values) }))
    .sort((a, b) => b.out - a.out)[0];

  const conclusion = best
    ? `${best.m.name} carries the case at ${best.out >= 0 ? '+' : ''}${best.out.toFixed(1)}% over eight quarters. The other ${shown.length - 1} model${shown.length === 2 ? '' : 's'} on the bench agree on direction and differ on size.`
    : 'Nothing is on the bench yet.';

  return (
    <section className="card panel report">
      <header className="panel-head">
        <div>
          <div className="card-title">Live model report</div>
          <div className="card-sub">Built from {shown.length} models &middot; updates as you move parameters</div>
        </div>
        <span className="live">
          <i />
          Live
        </span>
      </header>

      <div className="panel-body">
        {shown.map((m) => {
          const body = text[m.id] ?? m.line(state[m.id].values);
          return (
            <section className="rep" key={m.id}>
              <div className="rep-h">
                <span className="rep-n">{m.name}</span>
                <button className="icon-btn" onClick={() => setEdit(edit === m.id ? null : m.id)} title="Edit this finding">
                  <Pencil size={12} />
                </button>
              </div>
              {edit === m.id ? (
                <textarea
                  autoFocus
                  rows={4}
                  value={body}
                  onChange={(e) => setText({ ...text, [m.id]: e.target.value })}
                  onBlur={() => setEdit(null)}
                />
              ) : (
                <p>{body}</p>
              )}
            </section>
          );
        })}

        <section className="rep rep-end">
          <div className="rep-h">
            <span className="rep-n">Conclusion</span>
            <button className="icon-btn" onClick={() => setEdit(edit === 'end' ? null : 'end')} title="Edit the conclusion">
              <Pencil size={12} />
            </button>
          </div>
          {edit === 'end' ? (
            <textarea
              autoFocus
              rows={4}
              value={text.end ?? conclusion}
              onChange={(e) => setText({ ...text, end: e.target.value })}
              onBlur={() => setEdit(null)}
            />
          ) : (
            <p>{text.end ?? conclusion}</p>
          )}
        </section>
      </div>

      <footer className="proposal">
        <div className="prop-t">
          <strong>{sent ? 'Proposal sent to Mira Kapoor.' : 'Send this proposal to the portfolio manager?'}</strong>
          <span>
            {sent
              ? 'She will see it in her attention queue with every parameter attached.'
              : `${shown.length} models, ${shown.reduce((n, m) => n + state[m.id].params.length, 0)} parameters, ready to go.`}
          </span>
        </div>

        <div className="prop-row">
          <button className="prop-file" onClick={() => setPicking(!picking)} title="Change the format">
            <SrcDoc size={16} />
            <span className="prop-file-t">
              <span className="prop-file-n">{fmt.label}</span>
              <span className="prop-file-s">{fmt.sub}</span>
            </span>
            <Chevron size={12} />
          </button>

          <button className="btn-dark" onClick={() => setSent(true)} disabled={sent}>
            <Send size={14} />
            {sent ? 'Sent' : 'Send'}
          </button>

          {picking && (
            <Picker
              items={FORMATS.map((f) => ({ id: f.id, label: f.label, sub: f.sub }))}
              active={format}
              placeholder="Search formats"
              onPick={(id) => {
                setFormat(id);
                setPicking(false);
              }}
              onClose={() => setPicking(false)}
            />
          )}
        </div>
      </footer>
    </section>
  );
}
