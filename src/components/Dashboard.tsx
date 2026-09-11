import { useCallback, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import WidgetGrid from './WidgetGrid';
import type { Probe } from './WidgetGrid';
import WidgetPalette from './WidgetPalette';
import MetricStrip from './MetricStrip';
import PortfolioCard, { PortfolioTabs } from './PortfolioCard';
import AllocationCard from './AllocationCard';
import WatchlistCard from './WatchlistCard';
import SignalsCard from './SignalsCard';
import Blotter from './Blotter';
import AnalystWorkspace from './AnalystWorkspace';
import { AgentActivity, Protection, RiskEvaluation, RiskSimulation, RiskState, RiskStats } from './RiskCards';
import { IdeasFeed, ResearchActivity } from './ResearchCards';
import Decisions from './Decisions';
import { Plus } from './Icons';
import { ROLES } from './TopBar';
import type { Role } from './TopBar';
import { ROLE_LAYOUT, clearLayout, hasLayout, loadLayout, saveLayout, widgetDef } from '../data/widgets';
import type { Placed } from '../data/widgets';
import { TRADE_METRICS } from '../data/trades';
import type { AiContext } from '../data/ai';

type Props = {
  role: Role;
  context: AiContext | null;
  onContext: (c: AiContext | null) => void;
  paletteOpen: boolean;
  onPalette: (open: boolean) => void;
  /* open the surface a record points at */
  onGo?: (role: Role, view?: 'testbox') => void;
  /* the analyst's other tab: the idea hub itself */
  onWorkspace?: () => void;
};

const ARM = 4;

export default function Dashboard({ role, context, onContext, paletteOpen, onPalette, onGo, onWorkspace }: Props) {
  /* the record behind a metric, opened from the number itself */
  const [panel, setPanel] = useState<string | null>(null);
  const [items, setItems] = useState<Placed[]>(() => loadLayout(role));
  const [fresh, setFresh] = useState(() => !hasLayout(role));
  const [flash, setFlash] = useState<string | null>(null);
  /* a widget being dragged in from the catalogue, and where it would land */
  const [incoming, setIncoming] = useState<{ id: string; index: number } | null>(null);
  const [chip, setChip] = useState<{ id: string; x: number; y: number } | null>(null);

  const scroller = useRef<HTMLElement>(null);
  const probe = useRef<Probe>(() => 0);
  const live = useRef(items);
  const landing = useRef(incoming);

  live.current = items;
  landing.current = incoming;

  /* The board is a board until the catalogue is open. Only then does every
     card grow a handle, and only then is it safe to drag one by its face. */
  const arranging = paletteOpen;

  /* The last move of a drag may still be queued when the pointer comes up, so
     the layout is written down once the render that carries it has landed. */
  const settled = useCallback(() => {
    window.setTimeout(() => saveLayout(role, live.current), 0);
    setFresh(false);
  }, [role]);

  const commit = useCallback(
    (next: Placed[]) => {
      setItems(next);
      saveLayout(role, next);
      setFresh(false);
    },
    [role],
  );

  /* Worked out inside the update, so a second move arriving in the same frame
     reads the order the first one left behind rather than the one before it. */
  const move = useCallback((id: string, landing: number) => {
    setItems((prev) => {
      const from = prev.findIndex((p) => p.id === id);
      if (from < 0) return prev;
      const to = landing > from ? landing - 1 : landing;
      if (to === from || to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      const [row] = next.splice(from, 1);
      next.splice(to, 0, row);
      return next;
    });
  }, []);

  const span = useCallback(
    (id: string, s: Placed['span']) => commit(live.current.map((p) => (p.id === id ? { ...p, span: s } : p))),
    [commit],
  );

  const drop = useCallback((id: string) => commit(live.current.filter((p) => p.id !== id)), [commit]);

  const takeProbe = useCallback((p: Probe) => {
    probe.current = p;
  }, []);

  function place(ids: string[], at?: number) {
    const rows = ids
      .filter((id) => !live.current.some((p) => p.id === id))
      .map((id) => ({ id, span: widgetDef(id)!.spans[0] }));
    if (!rows.length) return;

    const next = [...live.current];
    next.splice(at ?? next.length, 0, ...rows);
    commit(next);

    setFlash(rows[0].id);
    window.setTimeout(() => setFlash(null), 1500);
    requestAnimationFrame(() =>
      scroller.current?.querySelector(`[data-w="${rows[0].id}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }),
    );
  }

  function reset() {
    clearLayout(role);
    setItems(ROLE_LAYOUT[role]);
    setFresh(true);
  }

  /* ---------------- pulling a widget out of the catalogue ---------------- */

  function lift(id: string, e: React.PointerEvent) {
    if (e.button !== 0 || live.current.some((p) => p.id === id)) return;
    const startX = e.clientX;
    const startY = e.clientY;
    let armed = false;

    function at(x: number, y: number) {
      const box = scroller.current?.getBoundingClientRect();
      const inside = !!box && x >= box.left && x <= box.right && y >= box.top && y <= box.bottom;
      if (!inside) return setIncoming(null);
      /* the outline already sits in the row, so its own slot is skipped and
         anything after it counted one place back */
      let index = probe.current(x, y, id);
      const held = landing.current?.index;
      if (held !== undefined && index > held) index -= 1;
      setIncoming({ id, index });
    }

    function onMove(ev: PointerEvent) {
      if (!armed) {
        if (Math.hypot(ev.clientX - startX, ev.clientY - startY) < ARM) return;
        armed = true;
        document.body.classList.add('is-moving-widget');
      }
      setChip({ id, x: ev.clientX, y: ev.clientY });
      at(ev.clientX, ev.clientY);
    }

    function onUp() {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      document.body.classList.remove('is-moving-widget');
      setChip(null);

      if (armed) {
        /* a press that turned into a drag must not also read as a click — but
           only the one the release itself fires, which is this tick's */
        const swallow = (c: Event) => c.stopPropagation();
        window.addEventListener('click', swallow, { capture: true, once: true });
        window.setTimeout(() => window.removeEventListener('click', swallow, { capture: true }), 0);
        if (landing.current) place([id], landing.current.index);
      }
      setIncoming(null);
    }

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  }

  /* ---------------- the widgets themselves ---------------- */

  /* Built once and held, so that rearranging the board moves the cards in the
     DOM without any chart being torn down and drawn again. */
  const views = useMemo(() => {
    const m = new Map<string, ReactNode>();
    m.set('metrics', <MetricStrip plain onPanel={setPanel} />);
    m.set('trade-metrics', <MetricStrip plain metrics={TRADE_METRICS} start={['filled', 'slip', 'working', 'auto']} />);
    m.set('portfolio', <PortfolioCard />);
    m.set('holdings', <PortfolioTabs />);
    m.set('allocation', <AllocationCard />);
    m.set('watchlist', <WatchlistCard />);
    m.set('blotter', <Blotter />);
    m.set('risk-stats', <RiskStats />);
    m.set('risk-state', <RiskState />);
    m.set('protection', <Protection />);
    m.set('activity', <AgentActivity />);
    m.set('evaluation', <RiskEvaluation />);
    m.set('simulation', <RiskSimulation />);
    m.set('workbench', <AnalystWorkspace onContext={onContext} />);
    m.set('ideas-feed', <IdeasFeed onGo={onWorkspace} />);
    m.set('research-activity', <ResearchActivity />);
    m.set('signals', <SignalsCard context={context} onContext={onContext} />);
    return m;
  }, [context, onContext, onWorkspace]);

  const display = useMemo(() => {
    if (!incoming) return items;
    const next = [...items];
    next.splice(incoming.index, 0, { id: incoming.id, span: widgetDef(incoming.id)!.spans[0] });
    return next;
  }, [incoming, items]);

  const desk = ROLES.find((r) => r.id === role)!;

  return (
    <>
      <main className={`dash ${arranging ? 'is-arranging' : ''}`} ref={scroller}>
        <WidgetGrid
          items={display}
          views={views}
          ghost={incoming?.id ?? null}
          customising={arranging}
          flash={flash}
          onMove={move}
          onSpan={span}
          onRemove={drop}
          onSettled={settled}
          onProbe={takeProbe}
          scroller={scroller}
        />

        {items.length === 0 && (
          <div className="dash-empty">
            <strong>Nothing on this dashboard yet.</strong>
            <span>Open the catalogue and pick the widgets this desk reads first.</span>
            <button className="btn-dark" onClick={() => onPalette(true)}>
              <Plus size={13} />
              Add a widget
            </button>
          </div>
        )}
      </main>

      {paletteOpen && (
        <WidgetPalette
          role={role}
          present={items.map((p) => p.id)}
          desk={desk.label}
          onAdd={(ids) => place(ids)}
          onRemove={drop}
          onReset={fresh ? undefined : reset}
          onClose={() => onPalette(false)}
          onLift={lift}
        />
      )}

      {chip && (
        <div className="dchip" style={{ transform: `translate(${chip.x + 14}px, ${chip.y - 16}px)` }}>
          {widgetDef(chip.id)!.name}
        </div>
      )}

      {panel === 'decisions' && (
        <Decisions
          onClose={() => setPanel(null)}
          onGo={(r, v) => {
            setPanel(null);
            onGo?.(r, v);
          }}
        />
      )}
    </>
  );
}
