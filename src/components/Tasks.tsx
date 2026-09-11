import { useEffect } from 'react';
import { ArrowOut, Check, Clock, FileText } from './Icons';
import { scheduleLabel } from '../data/tasks';
import type { Suggestion, TaskRun } from '../data/tasks';

/* The tasks side of the panel.

   Nothing here answers a question. A task is handed over and then watched,
   so the surface is a plan with a position marked on it. Until one is
   running there is only the shelf of things worth handing over. */

type Props = {
  run: TaskRun | null;
  suggestions: Suggestion[];
  scheduled: TaskRun[];
  onStart: (s: Suggestion) => void;
  onAdvance: () => void;
};

/* Long enough that the stepper reads as work rather than a loading bar. */
const STEP_MS = 2600;

export default function Tasks({ run, suggestions, scheduled, onStart, onAdvance }: Props) {
  const running = run !== null && run.done < run.steps.length;

  useEffect(() => {
    if (!running) return;
    const id = window.setTimeout(onAdvance, STEP_MS);
    return () => window.clearTimeout(id);
    /* the step count is what restarts the clock, one step at a time */
  }, [running, run?.id, run?.done, onAdvance]);

  if (!run)
    return (
      <div className="ai-body tsk-shelf">
        <p className="tsk-shelf-h">Get started with a task</p>

        <ul className="tsk-list">
          {suggestions.map((s) => (
            <li key={s.id}>
              <button className="tsk-card" onClick={() => onStart(s)}>
                <span className="tsk-card-t">{s.title}</span>
                <span className="tsk-card-n">{s.note}</span>
                <span className="tsk-card-s">{s.steps.length} steps</span>
              </button>
            </li>
          ))}
        </ul>

        {scheduled.length > 0 && (
          <>
            <div className="block-h as-label tsk-sched-h">On the calendar</div>
            <ul className="tsk-sched">
              {scheduled.map((s) => (
                <li key={s.id}>
                  <Clock size={13} />
                  <span>
                    <strong>{s.title}</strong>
                    <em>{s.schedule ? scheduleLabel(s.schedule) : ''}</em>
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}

        <p className="tsk-shelf-f">Or describe the task you want run instead.</p>
      </div>
    );

  return (
    <div className="ai-body tsk-run">
      <Stepper run={run} />

      <p className="tsk-brief">{run.brief}</p>

      <ol className="tsk-log">
        {run.steps.slice(0, Math.min(run.done + 1, run.steps.length)).map((s, i) => (
          <li key={s.label} className={i < run.done ? 'is-done' : 'is-now'}>
            <span className="tsk-log-m">{i < run.done ? <Check size={12} /> : <span className="spin" />}</span>
            <span className="tsk-log-t">
              <strong>{s.label}</strong>
              <em>{s.note}</em>
            </span>
          </li>
        ))}
      </ol>

      {/* The run ends in the thing it made. No announcement that it finished:
          the file being there is the announcement. */}
      {run.done === run.steps.length && (
        <div className="tsk-done">
          <p className="tsk-res-n">{run.result.note}</p>

          <div className="tsk-res">
            <span className="tsk-res-ic">
              <FileText size={18} />
            </span>
            <span className="tsk-res-c">
              <span className="tsk-res-t">
                {run.result.name}
                <ArrowOut size={12} />
              </span>
              <span className="tsk-res-w">{run.result.where}</span>
            </span>
            <button className="btn-dark">Open</button>
          </div>

          {run.schedule && <p className="tsk-done-s">{scheduleLabel(run.schedule)}. It will run again on its own.</p>}
        </div>
      )}
    </div>
  );
}

/* How far in, at a glance. It is the first thing in the panel because it is
   the only thing you need when you come back to it. */
function Stepper({ run }: { run: TaskRun }) {
  return (
    <ol className="tsk-steps">
      {run.steps.map((s, i) => (
        <li key={s.label} className={i < run.done ? 'is-done' : i === run.done ? 'is-now' : ''}>
          <span className="tsk-node">{i < run.done && <Check size={12} />}</span>
          <span className="tsk-node-t">{s.label}</span>
        </li>
      ))}
    </ol>
  );
}
