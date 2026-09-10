export type TaskState = 'working' | 'ready' | 'read';

/* What the PM has tagged for the copilot by picking a card. */
export type AiContext = {
  id: string;
  kind: 'need' | 'signal';
  title: string;
  sub: string;
  questions: string[];
  action?: { text: string; detail: string };
};

export type AiTask = {
  id: string;
  quote: string;
  question: string;
  state: TaskState;
  asked: string;
  seconds: number;
  answer: string;
  sources: string[];
};

const TICKERS = ['NVDA', 'MSFT', 'LLY', 'TSM', 'JPM', 'XOM', 'UNH', 'ASML', 'CAT', 'PLTR', 'VRT', 'AVGO', 'CRWD', 'DE', 'SHEL', 'NEE'];

function tickerIn(s: string): string | null {
  return TICKERS.find((t) => s.toUpperCase().includes(t)) ?? null;
}

function intentOf(q: string): 'why' | 'risk' | 'compare' | 'act' | 'explain' {
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
export function answerFor(question: string, quote: string): { answer: string; sources: string[]; seconds: number } {
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

  const sources =
    intent === 'compare' ? ['Position file', 'Benchmark feed', 'Peer group'] : intent === 'risk' ? ['Risk limits', 'Position file'] : ['Position file', 'Order blotter'];

  const words = question.trim().split(/\s+/).length + quote.trim().split(/\s+/).length;
  const seconds = Math.min(Math.max(2.5 + words * 0.12, 2.5), 8);

  return { answer, sources, seconds: +seconds.toFixed(1) };
}

export function clockNow(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
