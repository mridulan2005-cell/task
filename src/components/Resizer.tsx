import { useCallback, useEffect, useRef, useState } from 'react';

type Bound = { min: number; max: number; start: number };

/* Two draggable edges around a flexible middle column. Widths are held in
   pixels and clamped, so a panel can never be dragged out of usefulness. */
export function useColumns(left: Bound, right: Bound) {
  const [l, setL] = useState(left.start);
  const [r, setR] = useState(right.start);
  const drag = useRef<{ side: 'l' | 'r'; x: number; w: number } | null>(null);

  const move = useCallback(
    (e: MouseEvent) => {
      const d = drag.current;
      if (!d) return;
      const delta = e.clientX - d.x;
      if (d.side === 'l') setL(Math.min(Math.max(d.w + delta, left.min), left.max));
      else setR(Math.min(Math.max(d.w - delta, right.min), right.max));
    },
    [left.min, left.max, right.min, right.max],
  );

  const stop = useCallback(() => {
    drag.current = null;
    document.body.classList.remove('is-resizing');
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', stop);
    return () => {
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', stop);
    };
  }, [move, stop]);

  function start(side: 'l' | 'r') {
    return (e: React.MouseEvent) => {
      e.preventDefault();
      drag.current = { side, x: e.clientX, w: side === 'l' ? l : r };
      document.body.classList.add('is-resizing');
    };
  }

  return { l, r, start, template: `${l}px 6px minmax(0, 1fr) 6px ${r}px` };
}

export function Handle({ onDown, label }: { onDown: (e: React.MouseEvent) => void; label: string }) {
  return (
    <div className="handle" onMouseDown={onDown} role="separator" aria-label={label} aria-orientation="vertical">
      <span />
    </div>
  );
}
