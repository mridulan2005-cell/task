import { useEffect, useMemo, useState } from 'react';
import LineChart from './LineChart';
import type { Series } from './LineChart';
import Picker from './Picker';
import GraphCanvas, { GraphLeft } from './ModelGraphView';
import { Handle, useColumns } from './Resizer';
import { MODELS, MODEL_RANGES, defaults, modelLabels, modelPath, outcome, windowOf } from '../data/testbox';
import type { ModelRange, Param, TestModel } from '../data/testbox';
import { Box, Calendar, Check, Chevron, Nodes, Plus, Spark } from './Icons';
import type { AiContext } from '../data/ai';

type State = { params: Param[]; values: Record<string, number>; range: ModelRange };

const dollars = (v: number) => `$${v.toFixed(2)}`;
const dollarsAxis = (v: number) => `$${v.toFixed(0)}`;

export default function ModelTestbox({ onGraph, onContext }: { onGraph: (name: string | null) => void; onContext: (c: AiContext | null) => void }) {
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

  /* The copilot offers the report and takes its suggestions from the bench. */
  useEffect(() => {
    if (graph) return;
    const names = shown.map((m) => m.name);
    onContext(
      shown.length
        ? {
            id: 'bench',
            kind: 'model',
            title: names.length === 1 ? names[0] : `${names.length} models on the bench`,
            sub: names.join(' · '),
            cta: { label: 'Generate live model report', note: 'Built from what is selected, updates as you move parameters' },
            questions: [
              'Which model carries the case?',
              'Where do the three disagree?',
              'What breaks if the disputed input is wrong?',
            ],
            actions: ['Re-run all with the conservative inputs', 'Compare the outputs side by side', 'Send the strongest one to the PM'],
          }
        : null,
    );
  }, [shown, graph, onContext]);

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
    <main className={`testbox ${wired ? 'is-wired' : ''}`} style={{ gridTemplateColumns: `${cols.l}px 6px minmax(0, 1fr)` }}>
      {wired ? (
        <GraphLeft
          model={wired}
          models={MODELS}
          params={state[wired.id].params}
          values={state[wired.id].values}
          range={state[wired.id].range}
          onRange={(r) => setRange(wired.id, r)}
          onPick={(id) => openGraph(id)}
          onBack={() => openGraph(null)}
        />
      ) : (
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
      )}

      <Handle onDown={cols.start('l')} label="Resize the model list" />

      {wired ? (
        <GraphCanvas model={wired} onContext={onContext} />
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
