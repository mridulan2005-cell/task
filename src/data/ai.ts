import type { Ticket } from './riskModels';
import type { Source } from './needs';
import type { Detail } from './attention';
import { figureFor } from './figures';
import type { Figure } from './figures';

export type TaskState = 'working' | 'ready' | 'read';

/* What the PM has tagged for the copilot by picking a card. */
export type AiContext = {
  id: string;
  kind: 'need' | 'signal' | 'idea' | 'model' | 'node';
  title: string;
  sub: string;
  questions: string[];
  /* An action the agent already has drafted. 'pending' means an agent is
     still working and there is nothing to approve yet, so the panel says so
     instead of offering a control that would do nothing. */
  action?: { text: string; detail: string; pending?: boolean };
  /* things the PM could do next, offered as one-click asks */
  actions?: string[];
  /* the one large offer at the top of the panel */
  cta?: { label: string; note: string };
  /* what the officer can do with the bench once the testing is done */
  tools?: { id: string; label: string; note: string }[];
  /* the drafted order the bench arrives at, shown when the tool is opened */
  ticket?: Ticket;
  /* the same work written for someone who was not in the room */
  summary?: string[];
  /* what the agent read to raise it, shown behind the sources overlay */
  sources?: Source[];
  /* the full write-up behind an item from the queue. Its presence is what
     turns the panel into the detail view rather than the chat. */
  detail?: Detail;
};

export type AiTask = {
  id: string;
  /* What the question was asked about. Empty when it was asked of the book at
     large, and the answer then carries no reference line. */
  quote: string;
  question: string;
  state: TaskState;
  asked: string;
  seconds: number;
  answer: string;
  sources: Source[];
  /* the shape that came back with the answer */
  figure?: Figure;
};

const TICKERS = ['NVDA', 'MSFT', 'LLY', 'TSM', 'JPM', 'XOM', 'UNH', 'ASML', 'CAT', 'PLTR', 'VRT', 'AVGO', 'CRWD', 'DE', 'SHEL', 'NEE'];

function tickerIn(s: string): string | null {
  return TICKERS.find((t) => s.toUpperCase().includes(t)) ?? null;
}

/* What the question is after, which decides both how the answer reads and
   which shape comes back with it. */
export type Intent = 'why' | 'risk' | 'compare' | 'act' | 'explain';

export function intentOf(q: string): Intent {
  const s = q.toLowerCase();
  /* Comparison wins over cause, so "why are we ahead of the benchmark"
     answers with relative numbers rather than a driver breakdown. */
  if (/compare|versus|vs\b|against|benchmark|peer|ahead of|behind/.test(s)) return 'compare';
  if (/\bwhy\b|reason|cause|driver/.test(s)) return 'why';
  if (/risk|exposure|breach|cap|limit|downside|var\b/.test(s)) return 'risk';
  if (/should|can we|trim|sell|buy|hedge|do i|action|next/.test(s)) return 'act';
  return 'explain';
}

/* Answers are composed from the selection and the question so the panel reads
   like the agent actually looked at what the PM highlighted. */
/* What each kind of answer had to read. The list is longer than the answer
   needs so the overlay behaves like a real file list rather than a footnote. */
const READS: Record<Intent, Source[]> = {
  why: [
    { label: 'Position file — consolidated', kind: 'sheet' },
    { label: 'Order blotter, today', kind: 'sheet' },
    { label: 'Sector re-rating note', kind: 'doc' },
    { label: 'Market data feed', kind: 'feed' },
    { label: 'Desk thread — semis', kind: 'chat' },
  ],
  risk: [
    { label: 'Risk limits — mandate', kind: 'doc' },
    { label: 'Position file — consolidated', kind: 'sheet' },
    { label: 'var-daily (repo)', kind: 'repo' },
    { label: 'Tracking error run, 08:10', kind: 'sheet' },
    { label: 'Team drive — Q3 limits', kind: 'drive' },
  ],
  compare: [
    { label: 'Position file — consolidated', kind: 'sheet' },
    { label: 'Benchmark feed — S&P 500', kind: 'feed' },
    { label: 'Peer group holdings', kind: 'sheet' },
    { label: 'attribution (repo)', kind: 'repo' },
    { label: 'Team drive — Q3 folder', kind: 'drive' },
  ],
  act: [
    { label: 'Order blotter, today', kind: 'sheet' },
    { label: 'Risk limits — mandate', kind: 'doc' },
    { label: 'Execution schedule', kind: 'sheet' },
    { label: 'Desk thread — execution', kind: 'chat' },
  ],
  explain: [
    { label: 'Position file — consolidated', kind: 'sheet' },
    { label: 'Cost basis — March', kind: 'doc' },
    { label: 'Mark-to-market cycle', kind: 'feed' },
    { label: 'Team drive — accounting', kind: 'drive' },
  ],
};

export function answerFor(question: string, quote: string): { answer: string; sources: Source[]; seconds: number; figure: Figure } {
  const t = tickerIn(quote) ?? tickerIn(question);
  const subject = t ?? 'the highlighted figure';
  const Subject = t ?? 'The highlighted figure';
  const intent = intentOf(question);

  const answer =
    intent === 'why'
      ? `${Subject} moved on two things. The larger driver is the sector re-rating that started with the TSM fill at 14:32, worth about two thirds of the move. The rest is position specific and sits inside the normal daily range. Nothing in the mandate is breached by the move itself.`
      : intent === 'risk'
        ? `Against the mandate, ${subject} is the second largest contributor to tracking error at 1.1 points. The binding constraint is the 20% sector cap, not the single-name cap, which still has 0.6 points of headroom. A 1.4% trim clears both with room to spare.`
        : intent === 'compare'
          ? `Over the range on screen, ${subject} is running 4.1 points ahead of the S&P 500 and 2.3 points behind the semis index. Against the peer group it sits in the second quartile, with about two thirds of the gap explained by the semis overweight rather than selection.`
          : intent === 'act'
            ? `The cleanest action is a partial trim rather than a full exit. Taking 1.4% out of ${subject} over the last hour keeps you inside 15% of average volume, clears the cap before the close and leaves the thesis intact. Risk has the order drafted and it needs your approval to work.`
            : `${Subject} is carried at 6.2% of gross with a cost basis set in March. The figure you highlighted is the mark-to-market number, not realised, and it updates on the 15 minute cycle. The realised number for the same position is smaller by roughly a third.`;

  const sources = READS[intent];

  const words = question.trim().split(/\s+/).length + quote.trim().split(/\s+/).length;
  const seconds = Math.min(Math.max(2.5 + words * 0.12, 2.5), 8);

  /* The chart is cut from the same question and the same selection as the
     words, so the two can never describe different things. */
  return { answer, sources, seconds: +seconds.toFixed(1), figure: figureFor(intent, subject, quote) };
}

export function clockNow(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/* Follow-ups are cut from the answer that just landed, so they read as the
   next question rather than a standing menu. */
export function followUpsFor(question: string, quote: string): string[] {
  const t = tickerIn(quote) ?? tickerIn(question);
  const s = t ?? 'this';
  const intent = intentOf(question);

  if (intent === 'why')
    return [`What would reverse the ${s} move`, `How much of it is the sector rather than the name`, `Show the fills behind the 14:32 re-rating`];
  if (intent === 'risk')
    return [`What trim clears the sector cap on ${s}`, `Which limit binds first if the book grows`, `How does tracking error look after the trim`];
  if (intent === 'compare')
    return [`Split the gap into selection and allocation`, `Which peer is closest to ${s} on positioning`, `Run the same comparison over one year`];
  if (intent === 'act')
    return [`Draft the ${s} order at 15% of volume`, `What does the trim cost in tracking error`, `Who has to approve this before the close`];
  return [`Show the realised number next to the mark`, `What drives the ${s} carry from here`, `Where does this figure come from`];
}
