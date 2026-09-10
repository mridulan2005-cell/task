import { useEffect, useRef, useState } from 'react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import PortfolioCard from './components/PortfolioCard';
import MetricStrip from './components/MetricStrip';
import AllocationCard from './components/AllocationCard';
import NeedsYou from './components/NeedsYou';
import Watchlist from './components/Watchlist';
import { ProposalsCard, SignalsCard } from './components/SignalsCard';
import AiPanel from './components/AiPanel';
import AnalystWorkspace from './components/AnalystWorkspace';
import ModelTestbox from './components/ModelTestbox';
import RiskWorkspace from './components/RiskWorkspace';
import SelectionAsk from './components/SelectionAsk';
import { answerFor, clockNow } from './data/ai';
import type { AiTask } from './data/ai';
import type { Role } from './components/TopBar';
import './app.css';

let seq = 2;
let taskSeq = 1;

export default function App() {
  /* Deep links: #analyst and #testbox open straight into that surface. */
  const hash = typeof window === 'undefined' ? '' : window.location.hash;
  const analystLink = hash === '#analyst' || hash === '#testbox';
  const riskLink = hash === '#risk';

  const [collapsed, setCollapsed] = useState(analystLink);
  const [aiOpen, setAiOpen] = useState(false);
  const [nav, setNav] = useState('dashboard');
  const [role, setRole] = useState<Role>(analystLink ? 'analyst' : riskLink ? 'risk' : 'pm');
  const [view, setView] = useState<'work' | 'testbox'>(hash === '#testbox' ? 'testbox' : 'work');
  const [graphCrumb, setGraphCrumb] = useState<string | null>(null);
  const [tabs, setTabs] = useState([{ id: 'w1', label: 'My workspace' }]);
  const [activeTab, setActiveTab] = useState('w1');
  const [tasks, setTasks] = useState<AiTask[]>([]);

  /* The copilot needs the width, so opening it folds the rail down to icons.
     Closing it hands the rail back to whatever the PM had chosen. */
  const railBefore = useRef(false);

  function openAi() {
    railBefore.current = collapsed;
    setCollapsed(true);
    setAiOpen(true);
  }

  function toggleAi() {
    if (aiOpen) {
      setCollapsed(railBefore.current);
      setAiOpen(false);
    } else {
      openAi();
    }
  }

  function toggleRail() {
    railBefore.current = !collapsed;
    setCollapsed(!collapsed);
  }

  /* A question asked from a selection runs in the background. Nothing steals
     focus; the Ask AI button carries the only signal until it is opened. */
  function ask(quote: string, question: string) {
    const id = `t${taskSeq++}`;
    const { answer, sources, seconds } = answerFor(question, quote);
    setTasks((prev) => [{ id, quote, question, state: 'working', asked: clockNow(), seconds, answer, sources }, ...prev]);
    window.setTimeout(
      () => setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, state: t.state === 'working' ? 'ready' : t.state } : t))),
      seconds * 1000,
    );
  }

  /* Once the panel is open the answer has been seen, so the nudge stands down
     a beat later rather than blinking out the instant it lands. */
  useEffect(() => {
    if (!aiOpen || !tasks.some((t) => t.state === 'ready')) return;
    const id = window.setTimeout(() => setTasks((prev) => prev.map((t) => (t.state === 'ready' ? { ...t, state: 'read' } : t))), 1400);
    return () => window.clearTimeout(id);
  }, [aiOpen, tasks]);

  const nudge = tasks.some((t) => t.state === 'ready') ? 'ready' : tasks.some((t) => t.state === 'working') ? 'working' : 'none';

  /* The analyst layout wants the width, so that role opens on the icon rail. */
  function switchRole(r: Role) {
    setRole(r);
    setView('work');
    const folded = r === 'analyst';
    railBefore.current = folded;
    setCollapsed(folded);
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
    <div className={`shell role-${role} ${collapsed ? 'nav-collapsed' : ''} ${aiOpen ? 'ai-open' : ''}`}>
      <Sidebar
        collapsed={collapsed}
        onToggle={toggleRail}
        active={nav}
        onNavigate={(key) => setNav(key === nav && key === 'watchlist' ? 'dashboard' : key)}
      />

      {nav === 'watchlist' && (
        <div className="flyout">
          <Watchlist onClose={() => setNav('dashboard')} />
        </div>
      )}

      <div className="frame">
        <TopBar
          tabs={tabs}
          activeTab={activeTab}
          onTab={setActiveTab}
          onCloseTab={closeTab}
          onNewTab={newTab}
          aiOpen={aiOpen}
          onToggleAi={toggleAi}
          nudge={nudge}
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
            <main className="canvas">
              <div className="col col-main">
                <MetricStrip />
                <PortfolioCard />
                <AllocationCard />
              </div>
              <div className="col col-side">
                <NeedsYou />
                <SignalsCard />
                <ProposalsCard />
              </div>
            </main>
          ) : view === 'testbox' ? (
            <ModelTestbox onGraph={setGraphCrumb} />
          ) : (
            <AnalystWorkspace onOpenTestbox={() => setView('testbox')} />
          )}

          {aiOpen && <AiPanel tasks={tasks} onClose={toggleAi} />}
        </div>
      </div>

      <SelectionAsk
        onAsk={(quote, question) => {
          ask(quote, question);
        }}
      />
    </div>
  );
}
