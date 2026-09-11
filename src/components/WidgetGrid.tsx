import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import { Grip, SpanFull, SpanHalf, SpanThird, Trash } from './Icons';
import { widgetDef } from '../data/widgets';
import type { Placed, Span } from '../data/widgets';

type SpanIcon = (p: { size?: number; className?: string }) => ReactNode;

const SPAN_ICON: Record<Span, SpanIcon> = { 4: SpanThird, 6: SpanHalf, 12: SpanFull };
const SPAN_LABEL: Record<Span, string> = { 4: 'One third', 6: 'Half', 12: 'Full width' };

/* A press has to travel before it becomes a drag, so a click on the grip that
   wanders by a pixel still reads as a click. */
const ARM = 4;
/* How close to the edge of the scroller the pointer has to get before the
   dashboard starts following it. */
const EDGE = 76;
const EDGE_RATE = 13;

export type Probe = (x: number, y: number, skip?: string) => number;

/* A seat is where a widget belongs, measured against the grid itself rather
   than the window. Reading it that way survives both scrolling and the
   movement animations, which is what keeps a drag from chasing its own tail. */
type Seat = { x: number; y: number; w: number; h: number; i: number };

type Props = {
  items: Placed[];
  /* rendered widget bodies, held by the dashboard so that rearranging never
     re-renders a chart */
  views: Map<string, ReactNode>;
  /* the widget being dragged in from the catalogue, drawn as an outline */
  ghost: string | null;
  customising: boolean;
  /* a widget that has just been added, ringed for a moment */
  flash: string | null;
  /* names the widget rather than its index, because several moves can land in
     one frame and an index taken before the first is stale by the second */
  onMove: (id: string, landing: number) => void;
  onSpan: (id: string, span: Span) => void;
  onRemove: (id: string) => void;
  /* the layout stopped changing and can be written down */
  onSettled: () => void;
  /* hands the catalogue a way to ask where a drop would land */
  onProbe: (probe: Probe) => void;
  scroller: RefObject<HTMLElement | null>;
};

export default function WidgetGrid({ items, views, ghost, customising, flash, onMove, onSpan, onRemove, onSettled, onProbe, scroller }: Props) {
  const root = useRef<HTMLDivElement>(null);
  /* where every widget sat at the end of the last render, so a change of order
     can be played as a movement rather than a jump */
  const seats = useRef(new Map<string, Seat>());
  const drag = useRef<{ id: string; px: number; py: number; ox: number; oy: number; x: number; y: number } | null>(null);
  const settle = useRef<{ id: string; x: number; y: number } | null>(null);
  const live = useRef(items);
  const [lifted, setLifted] = useState<string | null>(null);

  live.current = items;

  const cell = useCallback((id: string) => root.current?.querySelector<HTMLElement>(`[data-w="${id}"]`) ?? null, []);

  /* ---------------- movement, played after every change ---------------- */

  useLayoutEffect(() => {
    if (!root.current) return;
    const nodes = Array.from(root.current.querySelectorAll<HTMLElement>('[data-w]'));
    const box = root.current.getBoundingClientRect();
    const now = new Map<string, Seat>();
    const runs: [HTMLElement, number, number][] = [];

    for (const el of nodes) {
      const id = el.dataset.w!;
      /* measure the seat, not where the widget currently appears */
      el.style.transition = 'none';
      el.style.transform = 'none';
      const r = el.getBoundingClientRect();
      const seat: Seat = { x: r.left - box.left, y: r.top - box.top, w: r.width, h: r.height, i: Number(el.dataset.i) };
      now.set(id, seat);

      const was = seats.current.get(id);
      const dx = was ? was.x - seat.x : 0;
      const dy = was ? was.y - seat.y : 0;

      if (drag.current?.id === id) {
        /* the lifted widget stays under the cursor: whatever its seat moved
           by, its offset moves back by the same amount */
        drag.current.ox += dx;
        drag.current.oy += dy;
        el.style.transform = `translate(${drag.current.x - drag.current.px + drag.current.ox}px, ${drag.current.y - drag.current.py + drag.current.oy}px)`;
        continue;
      }

      if (settle.current?.id === id) {
        runs.push([el, settle.current.x, settle.current.y]);
        settle.current = null;
        continue;
      }

      if (was && (dx || dy)) {
        runs.push([el, dx, dy]);
      } else {
        el.style.transform = '';
        el.style.transition = '';
      }
    }

    seats.current = now;

    for (const [el, dx, dy] of runs) el.style.transform = `translate(${dx}px, ${dy}px)`;
    if (runs.length) {
      requestAnimationFrame(() => {
        for (const [el] of runs) {
          el.style.transition = '';
          el.style.transform = '';
        }
      });
    }
  });

  /* ---------------- where a drop lands ---------------- */

  const probe = useCallback((x: number, y: number, skip?: string) => {
    const box = root.current?.getBoundingClientRect();
    if (!box) return 0;
    let index = 0;
    let best = Infinity;
    let after = false;

    for (const [id, seat] of seats.current) {
      if (id === skip) continue;
      const cx = box.left + seat.x + seat.w / 2;
      const cy = box.top + seat.y + seat.h / 2;
      const d = Math.hypot(x - cx, y - cy);
      if (d >= best) continue;
      best = d;
      index = seat.i;
      /* fall on the axis the pointer is furthest along, so a full-width card
         is split top and bottom and a half-width one left and right */
      const rx = (x - cx) / seat.w;
      const ry = (y - cy) / seat.h;
      after = Math.abs(ry) > Math.abs(rx) ? ry > 0 : rx > 0;
    }

    if (best === Infinity) return live.current.length;
    return after ? index + 1 : index;
  }, []);

  useEffect(() => {
    onProbe((x, y, skip) => probe(x, y, skip));
  }, [onProbe, probe]);

  /* ---------------- dragging a widget by its grip ---------------- */

  function lift(e: React.PointerEvent, id: string) {
    if (e.button !== 0) return;
    e.preventDefault();

    const startX = e.clientX;
    const startY = e.clientY;
    let armed = false;
    let frame = 0;

    function place(x: number, y: number) {
      const d = drag.current;
      if (!d) return;
      d.x = x;
      d.y = y;
      const el = cell(d.id);
      if (el) el.style.transform = `translate(${x - d.px + d.ox}px, ${y - d.py + d.oy}px)`;

      onMove(d.id, probe(x, y, d.id));
    }

    /* the dashboard follows the pointer when it reaches either end */
    function chase() {
      frame = requestAnimationFrame(chase);
      const d = drag.current;
      const box = scroller.current;
      if (!d || !box) return;
      const r = box.getBoundingClientRect();
      const up = d.y - r.top;
      const down = r.bottom - d.y;
      const step = up < EDGE ? -EDGE_RATE * (1 - up / EDGE) : down < EDGE ? EDGE_RATE * (1 - down / EDGE) : 0;
      if (!step) return;
      const before = box.scrollTop;
      box.scrollTop += step;
      const moved = box.scrollTop - before;
      if (!moved) return;
      /* the board slid under the card, so the card slides back over it */
      d.oy += moved;
      place(d.x, d.y);
    }

    function move(ev: PointerEvent) {
      if (!armed) {
        if (Math.hypot(ev.clientX - startX, ev.clientY - startY) < ARM) return;
        armed = true;
        drag.current = { id, px: ev.clientX, py: ev.clientY, ox: 0, oy: 0, x: ev.clientX, y: ev.clientY };
        setLifted(id);
        document.body.classList.add('is-moving-widget');
        frame = requestAnimationFrame(chase);
      }
      place(ev.clientX, ev.clientY);
    }

    function up() {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      cancelAnimationFrame(frame);
      document.body.classList.remove('is-moving-widget');

      const d = drag.current;
      if (d) {
        /* hand the offset to the settle so the widget glides into its seat */
        settle.current = { id: d.id, x: d.x - d.px + d.ox, y: d.y - d.py + d.oy };
        drag.current = null;
        setLifted(null);
        onSettled();
      }
    }

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  }

  /* The grip is a button, so the same rearranging works from the keyboard. */
  function key(e: React.KeyboardEvent, index: number) {
    const back = e.key === 'ArrowLeft' || e.key === 'ArrowUp';
    const on = e.key === 'ArrowRight' || e.key === 'ArrowDown';
    if (!back && !on) return;
    if (back ? index === 0 : index === items.length - 1) return;
    e.preventDefault();
    const id = items[index].id;
    /* a landing index is read before the widget leaves its own slot, so going
       one place later means aiming two slots along */
    onMove(id, back ? index - 1 : index + 2);
    onSettled();
    /* keep the grip under the hands after the widget has moved */
    requestAnimationFrame(() => cell(id)?.querySelector<HTMLElement>('.dw-grip')?.focus());
  }

  return (
    <div className={`dgrid ${customising ? 'is-customising' : ''} ${lifted ? 'is-moving' : ''}`} ref={root}>
      {items.map((p, i) => {
        const def = widgetDef(p.id);
        if (!def) return null;
        const isGhost = ghost === p.id;

        return (
          <div
            key={p.id}
            data-w={p.id}
            data-i={i}
            className={`dw s-${p.span} ${lifted === p.id ? 'is-lifted' : ''} ${isGhost ? 'is-ghost' : ''} ${flash === p.id ? 'is-new' : ''}`}
          >
            {!isGhost && (
              <div className="dw-bar">
                <button
                  className="dw-grip"
                  onPointerDown={(e) => lift(e, p.id)}
                  onKeyDown={(e) => key(e, i)}
                  title="Drag to rearrange, or use the arrow keys"
                  aria-label={`Move ${def.name}`}
                >
                  <Grip size={14} />
                </button>

                {def.spans.length > 1 && (
                  <span className="dw-spans">
                    {[...def.spans].sort((a, b) => a - b).map((s) => {
                      const Icon = SPAN_ICON[s];
                      return (
                        <button
                          key={s}
                          className={s === p.span ? 'is-on' : ''}
                          onClick={() => {
                            onSpan(p.id, s);
                            onSettled();
                          }}
                          title={`${SPAN_LABEL[s]} width`}
                          aria-label={`${SPAN_LABEL[s]} width`}
                          aria-pressed={s === p.span}
                        >
                          <Icon size={14} />
                        </button>
                      );
                    })}
                  </span>
                )}

                <button className="dw-drop" onClick={() => onRemove(p.id)} title="Remove from dashboard" aria-label={`Remove ${def.name}`}>
                  <Trash size={13} />
                </button>
              </div>
            )}

            {isGhost ? (
              <div className="dw-slot">
                <span className="dw-slot-n">{def.name}</span>
                <span className="dw-slot-s">Drop to place it here</span>
              </div>
            ) : (
              <div className="dw-body">{views.get(p.id)}</div>
            )}

            {/* while customising, the whole card is the handle and nothing
                inside it can be clicked by accident */}
            {customising && !isGhost && <span className="dw-scrim" onPointerDown={(e) => lift(e, p.id)} />}
          </div>
        );
      })}
    </div>
  );
}
