import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import PmDashboard from './components/PmDashboard';
import AiPanel from './components/AiPanel';
import AnalystWorkspace from './components/AnalystWorkspace';
import ModelTestbox from './components/ModelTestbox';
import RiskWorkspace from './components/RiskWorkspace';
import SelectionAsk from './components/SelectionAsk';
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

  const [collapsed, setCollapsed] = useState(false);
  const [nav, setNav] = useState('dashboard');
  const [role, setRole] = useState<Role>(analystLink ? 'analyst' : hash === '#risk' ? 'risk' : 'pm');
  const [view, setView] = useState<'work' | 'testbox'>(hash === '#testbox' ? 'testbox' : 'work');
  const [graphCrumb, setGraphCrumb] = useState<string | null>(null);
  const [tabs, setTabs] = useState([{ id: 'w1', label: 'My workspace' }]);
  const [activeTab, setActiveTab] = useState('w1');
  const [tasks, setTasks] = useState<AiTask[]>([]);
  const [context, setContext] = useState<AiContext | null>(null);

  /* A question asked from a selection runs in the background. Nothing steals
     focus; the copilot panel carries the only signal until it is read. */
  function ask(quote: string, question: string) {
    const id = `t${taskSeq++}`;
    const { answer, sources, seconds } = answerFor(question, quote);
    setTasks((prev) => [{ id, quote, question, state: 'working', asked: clockNow(), seconds, answer, sources }, ...prev]);
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

  return (
    <div className={`shell role-${role} ${collapsed ? 'nav-collapsed' : ''}`}>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} active={nav} onNavigate={setNav} role={role} />

      <div className="frame">
        <TopBar
          tabs={tabs}
          activeTab={activeTab}
          onTab={setActiveTab}
          onCloseTab={closeTab}
          onNewTab={newTab}
          role={role}
          onRole={switchRole}
          crumb={view === 'testbox' ? 'Model testbox' : undefined}
          crumbLast={view === 'testbox' ? graphCrumb ?? undefined : undefined}
          onCrumbHome={() => {
            setView('work');
            setGraphCrumb(null);
          }}
        />

        <div className="body">
          {role === 'risk' ? (
            <RiskWorkspace />
          ) : role === 'pm' ? (
            <PmDashboard context={context} onContext={setContext} />
          ) : view === 'testbox' ? (
            <ModelTestbox onGraph={setGraphCrumb} onContext={setContext} />
          ) : (
            <AnalystWorkspace onContext={setContext} />
          )}
        </div>
      </div>

      <AiPanel
        tasks={tasks}
        nudge={nudge}
        role={role}
        context={context}
        mode={role === 'analyst' && view === 'work' ? 'templates' : 'chat'}
        onClearContext={() => setContext(null)}
        onAsk={ask}
        onCreateModel={() => setView('testbox')}
      />

      <SelectionAsk onAsk={ask} />
    </div>
  );
}
