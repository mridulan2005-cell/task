import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import Dashboard from './components/Dashboard';
import AiPanel from './components/AiPanel';
import ModelTestbox from './components/ModelTestbox';
import AnalystWorkspace from './components/AnalystWorkspace';
import AgentsView from './components/AgentsView';
import RiskReview from './components/RiskReview';
import RiskDoc from './components/RiskDoc';
import SelectionAsk from './components/SelectionAsk';
import { RegionsProvider } from './components/Regions';
import { answerFor, clockNow } from './data/ai';
import type { AiContext, AiTask } from './data/ai';
import type { Role } from './components/TopBar';
import './app.css';

let seq = 2;
let taskSeq = 1;

export default function App() {
  /* Deep links: #analyst, #testbox and #risk open straight into that surface. */
  const hash = typeof window === 'undefined' ? '' : window.location.hash;
  const analystLink = hash === '#analyst' || hash === '#testbox';

  /* Only a dashboard gets the full rail; every other workspace folds it. */
  const [collapsed, setCollapsed] = useState(analystLink);
  const [nav, setNav] = useState('dashboard');
  const [role, setRole] = useState<Role>(analystLink ? 'analyst' : hash === '#risk' ? 'risk' : 'pm');
  const [view, setView] = useState<'work' | 'testbox'>(hash === '#testbox' ? 'testbox' : 'work');
  const [graphCrumb, setGraphCrumb] = useState<string | null>(null);
  const [tabs, setTabs] = useState([{ id: 'w1', label: 'My workspace' }]);
  const [activeTab, setActiveTab] = useState('w1');
  /* The analyst's tabs are not saved workspaces; they are the two surfaces
     that desk works on, and the top bar is the switch between them. */
  const [deskTab, setDeskTab] = useState<'dash' | 'work'>(analystLink ? 'work' : 'dash');
  const [tasks, setTasks] = useState<AiTask[]>([]);
  const [context, setContext] = useState<AiContext | null>(null);
  const [doc, setDoc] = useState<string[] | null>(null);
  /* the widget catalogue, opened by Create in the rail or from the dashboard */
  const [palette, setPalette] = useState(false);

  /* A question asked from a selection runs in the background. Nothing steals
     focus; the copilot panel carries the only signal until it is read. */
  function ask(quote: string, question: string) {
    const id = `t${taskSeq++}`;
    const { answer, sources, seconds, figure } = answerFor(question, quote);
    setTasks((prev) => [{ id, quote, question, state: 'working', asked: clockNow(), seconds, answer, sources, figure }, ...prev]);
    window.setTimeout(
      () => setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, state: t.state === 'working' ? 'ready' : t.state } : t))),
      seconds * 1000,
    );
  }

  /* The panel is always on screen now, so an answer stands down a few seconds
     after it lands instead of waiting to be opened. */
  useEffect(() => {
    if (!tasks.some((t) => t.state === 'ready')) return;
    const id = window.setTimeout(() => setTasks((prev) => prev.map((t) => (t.state === 'ready' ? { ...t, state: 'read' } : t))), 4200);
    return () => window.clearTimeout(id);
  }, [tasks]);

  const nudge = tasks.some((t) => t.state === 'ready') ? 'ready' : tasks.some((t) => t.state === 'working') ? 'working' : 'none';

  function switchRole(r: Role) {
    setRole(r);
    setView('work');
    setGraphCrumb(null);
    setContext(null);
    setCollapsed(r === 'analyst');
  }

  /* Opening the surface a record points at, from the agents view or from a
     line in the decision log. */
  function go(r: Role, v?: 'testbox') {
    setNav('dashboard');
    setRole(r);
    setView(v ?? 'work');
    setGraphCrumb(null);
    setCollapsed(r === 'analyst');
  }

  /* Create builds the dashboard. It takes you back to it first, so the
     catalogue always opens over the thing it is adding to. */
  function create() {
    setNav('dashboard');
    setView('work');
    setPalette(true);
  }

  function newTab() {
    const id = `w${seq++}`;
    setTabs([...tabs, { id, label: `Workspace ${tabs.length + 1}` }]);
    setActiveTab(id);
  }

  function closeTab(id: string) {
    const next = tabs.filter((t) => t.id !== id);
    setTabs(next);
    if (activeTab === id) setActiveTab(next[next.length - 1].id);
  }

  /* The analyst works across two surfaces, so its tabs name them. Every other
     desk keeps the saved workspaces it had. */
  const desk = role === 'analyst';
  const deskTabs = [
    { id: 'dash', label: 'Dashboard' },
    { id: 'work', label: 'Workspace' },
  ];
  /* the idea hub, open as its own surface rather than as a widget */
  const onHub = desk && view === 'work' && deskTab === 'work';

  /* Sections dragged out of the charts live above every surface, so one
     question can carry a stretch of two different visualisations. */
  return (
    <RegionsProvider>
    <div className={`shell role-${role} ${collapsed ? 'nav-collapsed' : ''}`}>
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(!collapsed)}
        active={nav}
        onNavigate={setNav}
        role={role}
        onCreate={create}
      />

      <div className="frame">
        <TopBar
          tabs={desk ? deskTabs : tabs}
          activeTab={desk ? deskTab : activeTab}
          onTab={(id) => (desk ? setDeskTab(id as 'dash' | 'work') : setActiveTab(id))}
          onCloseTab={closeTab}
          onNewTab={newTab}
          switcher={desk}
          role={role}
          onRole={switchRole}
          crumb={nav !== 'agents' && view === 'testbox' ? (role === 'risk' ? 'Risk review' : 'Model testbox') : undefined}
          crumbLast={nav !== 'agents' && view === 'testbox' && role !== 'risk' ? graphCrumb ?? undefined : undefined}
          onCrumbHome={() => {
            setView('work');
            setGraphCrumb(null);
          }}
        />

        <div className="body">
          {nav === 'agents' ? (
            <AgentsView
              context={context}
              onContext={setContext}
              onGo={go}
            />
          ) : role === 'risk' && view === 'testbox' ? (
            <RiskReview onContext={setContext} />
          ) : role === 'analyst' && view === 'testbox' ? (
            <ModelTestbox onGraph={setGraphCrumb} onContext={setContext} />
          ) : onHub ? (
            /* the idea hub as a surface of its own, not a card on a board */
            <AnalystWorkspace onContext={setContext} />
          ) : (
            /* Every desk opens on the same thing: widgets it arranged itself,
               starting from the template its role was given. */
            <Dashboard
              key={role}
              role={role}
              context={context}
              onContext={setContext}
              paletteOpen={palette}
              onPalette={setPalette}
              onGo={go}
              onWorkspace={() => setDeskTab('work')}
            />
          )}
        </div>
      </div>

      <AiPanel
        tasks={tasks}
        nudge={nudge}
        role={role}
        context={context}
        mode={onHub ? 'templates' : 'chat'}
        onClearContext={() => setContext(null)}
        onContext={setContext}
        onAsk={ask}
        onCreateModel={() => setView('testbox')}
        onDoc={setDoc}
        onNewChat={() => {
          setTasks([]);
          setContext(null);
        }}
        onOpenWorkspace={() => {
          setNav('dashboard');
          setView('work');
          setDeskTab('work');
        }}
      />

      <SelectionAsk onAsk={ask} />

      {doc && <RiskDoc paras={doc} onClose={() => setDoc(null)} />}
    </div>
    </RegionsProvider>
  );
}
