import { useEffect, useMemo, useState } from 'react';
import LineChart from './LineChart';
import type { Series } from './LineChart';
import Picker from './Picker';
import { Handle, useColumns } from './Resizer';
import { MODEL_RANGES, RISK_MODELS, riskPath, summaryFrom, ticketFrom } from '../data/riskModels';
import type { ModelRange, Param, RiskModel } from '../data/riskModels';
import { defaults, modelLabels, windowOf } from '../data/testbox';
import { LIMITS, MODEL, SHOCK, validity } from '../data/riskReview';
import { Alert, Box, Calendar, Check, Plus, Spark } from './Icons';
import { clockNow } from '../data/ai';
import type { AiContext } from '../data/ai';

type State = { params: Param[]; values: Record<string, number>; range: ModelRange };
type Test = { id: string; time: string; model: string; text: string; seal: string };

let sealSeq = 0;
/* stands in for the signature the real log writes against each run */
function seal(): string {
  const hex = (Math.abs(Math.sin(++sealSeq * 97.31)) * 0xffffff) | 0;
  return `0x${hex.toString(16).padStart(6, '0').slice(0, 4)}…${(hex * 7).toString(16).slice(-4)}`;
}

export default function RiskReview({ onContext }: { onContext: (c: AiContext | null) => void }) {
  const cols = useColumns({ min: 190, max: 340, start: 216 }, { min: 260, max: 440, start: 310 });

  const [on, setOn] = useState<string[]>(RISK_MODELS.map((m) => m.id));
  const [state, setState] = useState<Record<string, State>>(() => {
    const out: Record<string, State> = {};
    RISK_MODELS.forEach((m) => (out[m.id] = { params: m.params, values: defaults(m), range: '1Y' }));
    return out;
  });
  const [adding, setAdding] = useState<string | null>(null);
  const [history, setHistory] = useState<Test[]>([]);

  const shown = RISK_MODELS.filter((m) => on.includes(m.id));
  const values = useMemo(() => {
    const out: Record<string, Record<string, number>> = {};
    Object.entries(state).forEach(([k, s]) => (out[k] = s.values));
    return out;
  }, [state]);

  /* The panel carries the two things the officer can do once the bench has
     been pushed around: draft the order, or write it up for everyone else. */
  useEffect(() => {
    onContext(
      shown.length
        ? {
            id: 'risk-bench',
            kind: 'model',
            title: `${SHOCK.ticker} escalation · ${shown.length} model${shown.length === 1 ? '' : 's'} on the bench`,
            sub: shown.map((m) => m.name).join(' · '),
            tools: [
              { id: 'propose', label: 'Propose trade', note: 'Drafts the order the bench arrives at' },
              { id: 'summary', label: 'Write shareable summary', note: 'Plain English, ready for a shared doc' },
            ],
            ticket: ticketFrom(values),
            summary: summaryFrom(on, values),
            questions: [
              'Which parameter moves VaR the most?',
              'Does the trim survive the stress replay?',
              'Is the model still valid after the shock?',
            ],
          }
        : null,
    );
  }, [shown, on, values, onContext]);

  function record(model: string, text: string) {
    setHistory((h) => [{ id: `t${h.length + 1}`, time: clockNow(), model, text, seal: seal() }, ...h].slice(0, 40));
  }

  function setValue(id: string, pid: string, v: number) {
    setState((s) => ({ ...s, [id]: { ...s[id], values: { ...s[id].values, [pid]: v } } }));
  }

  /* Logged when the slider is let go, not on every pixel of the drag. */
  function commit(m: RiskModel, pid: string) {
    const p = m.params.find((x) => x.id === pid) ?? m.extra.find((x) => x.id === pid);
    const v = state[m.id].values[pid];
    if (!p || v === undefined) return;
    record(m.name, `${p.label} set to ${v}${p.unit} · ${m.measure} ${m.level(state[m.id].values).toFixed(m.dp)}${m.unit}`);
  }

  function addParam(id: string, pid: string) {
    const m = RISK_MODELS.find((x) => x.id === id)!;
    const p = m.extra.find((x) => x.id === pid)!;
    setState((s) => ({ ...s, [id]: { ...s[id], params: [...s[id].params, p], values: { ...s[id].values, [p.id]: p.def } } }));
    setAdding(null);
    record(m.name, `Added ${p.label} to the run.`);
  }

  function setRange(id: string, range: ModelRange) {
    setState((s) => ({ ...s, [id]: { ...s[id], range } }));
  }

  function reset(id: string) {
    const m = RISK_MODELS.find((x) => x.id === id)!;
    setState((s) => ({ ...s, [id]: { ...s[id], params: m.params, values: defaults(m) } }));
    record(m.name, 'Reset to the agent’s inputs.');
  }

  function toggle(id: string) {
    const m = RISK_MODELS.find((x) => x.id === id)!;
    const picked = on.includes(id);
    setOn(picked ? on.filter((x) => x !== id) : [...on, id]);
    record(m.name, picked ? 'Taken off the bench.' : 'Brought onto the bench.');
  }

  return (
    <main className="testbox" style={{ gridTemplateColumns: `${cols.l}px 6px minmax(0, 1fr)` }}>
      <section className="card panel runlist">
        <header className="panel-head">
          <div>
            <div className="card-title">Risk models running</div>
            <div className="card-sub">
              {shown.length} of {RISK_MODELS.length} shown
            </div>
          </div>
        </header>

        <div className="panel-body">
          <ul className="runs">
            {RISK_MODELS.map((m) => {
              const picked = on.includes(m.id);
              const lvl = m.level(state[m.id].values);
              const over = m.limit !== undefined && lvl > m.limit;
              return (
                <li key={m.id}>
                  <button className={`run ${picked ? 'is-on' : ''}`} onClick={() => toggle(m.id)}>
                    <span className="run-box">{picked ? <Check size={12} /> : <Box size={14} />}</span>
                    <span className="run-t">
                      <span className="run-n">{m.name}</span>
                      <span className="run-s">{m.on}</span>
                    </span>
                    <span className={`run-out ${over ? 'down' : ''}`}>
                      {lvl.toFixed(m.dp)}
                      {m.unit}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <footer className="panel-foot">
          <button className="btn-soft wide">
            <Spark size={13} />
            Create
          </button>
        </footer>
      </section>

      <Handle onDown={cols.start('l')} label="Resize the model list" />

      <div className="testbox-mid">
        <Escalation />

        {shown.map((m) => (
          <RiskCard
            key={m.id}
            model={m}
            state={state[m.id]}
            adding={adding === m.id}
            onAdd={() => setAdding(adding === m.id ? null : m.id)}
            onAddParam={(pid) => addParam(m.id, pid)}
            onCloseAdd={() => setAdding(null)}
            onValue={(pid, v) => setValue(m.id, pid, v)}
            onCommit={(pid) => commit(m, pid)}
            onRange={(r) => setRange(m.id, r)}
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

        <TestHistory history={history} />
      </div>
    </main>
  );
}

/* ---------------- what is being reviewed ---------------- */

function Escalation() {
  const check = validity();

  return (
    <section className="card rrev-head">
      <span className="rrev-ic">
        <Alert size={19} />
      </span>
      <div className="rrev-h">
        <div className="rrev-t">
          {SHOCK.ticker} gain of {SHOCK.move}% outside the fitted model
        </div>
        <p>
          {SHOCK.test} fired at {SHOCK.raised}. The position is {SHOCK.weight}% of NAV against a {LIMITS.singleName}% single-name cap.{' '}
          {check.headline}: realised vol is {MODEL.realisedSigma}% against the {MODEL.fittedSigma}% the model was fitted on, so treat the
          numbers below as a floor.
        </p>
      </div>
      <dl className="rrev-facts">
        <div>
          <dt>Move</dt>
          <dd className="up">+{SHOCK.move}%</dd>
        </div>
        <div>
          <dt>Notional</dt>
          <dd>{SHOCK.notional}</dd>
        </div>
        <div>
          <dt>Agent asks</dt>
          <dd>40% trim</dd>
        </div>
      </dl>
    </section>
  );
}

/* ---------------- one risk model on the bench ---------------- */

function RiskCard({
  model,
  state,
  adding,
  onAdd,
  onAddParam,
  onCloseAdd,
  onValue,
  onCommit,
  onRange,
  onReset,
}: {
  model: RiskModel;
  state: State;
  adding: boolean;
  onAdd: () => void;
  onAddParam: (pid: string) => void;
  onCloseAdd: () => void;
  onValue: (pid: string, v: number) => void;
  onCommit: (pid: string) => void;
  onRange: (r: ModelRange) => void;
  onReset: () => void;
}) {
  const series: Series[] = useMemo(
    () => [
      {
        key: 'live',
        label: model.measure,
        data: riskPath(model, state.params, state.values, state.range),
        color: '#1d7de0',
        fill: true,
      },
    ],
    [model, state],
  );
  const labels = useMemo(() => modelLabels(state.range), [state.range]);
  const [scrub, setScrub] = useState<string | null>(null);

  const level = model.level(state.values);
  const over = model.limit !== undefined && level > model.limit;
  const moved = state.params.some((p) => (state.values[p.id] ?? p.def) !== p.def);
  const free = model.extra.filter((e) => !state.params.some((p) => p.id === e.id));
  const fmt = (v: number) => `${v.toFixed(model.dp)}${model.unit}`;

  return (
    <section className="card bench">
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
          <span className={`bench-level ${over ? 'is-over' : ''}`}>
            <em>{model.measure}</em>
            {fmt(level)}
            {model.limit !== undefined && <i>{over ? <Alert size={10} /> : <Check size={10} />}</i>}
          </span>
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
        <LineChart labels={labels} series={series} height={176} format={fmt} formatAxis={fmt} xTicks={6} />
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
                    onPointerUp={() => onCommit(p.id)}
                    onPointerLeave={() => setScrub(null)}
                    onKeyUp={() => onCommit(p.id)}
                    onFocus={() => setScrub(p.id)}
                    onBlur={() => setScrub(null)}
                    style={{ backgroundSize: `${pos}% 100%` }}
                  />
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

/* ---------------- every run, kept ---------------- */

function TestHistory({ history }: { history: Test[] }) {
  return (
    <section className="card thist">
      <header className="card-head">
        <div>
          <div className="card-title">Test history</div>
          <div className="card-sub">Sealed as you go, kept for model risk governance</div>
        </div>
        <span className="chip">{history.length} runs</span>
      </header>

      {history.length === 0 ? (
        <div className="empty">
          <strong>Nothing run yet.</strong>
          <span>Move a parameter and every run is logged here.</span>
        </div>
      ) : (
        <ol className="thist-list">
          {history.map((h) => (
            <li key={h.id}>
              <span className="thist-t">{h.time}</span>
              <span className="thist-m">{h.model}</span>
              <span className="thist-x">{h.text}</span>
              <span className="thist-s">{h.seal}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
