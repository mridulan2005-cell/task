import { useCallback, useEffect, useRef, useState } from 'react';
import { Chevron, Send, Spark } from './Icons';

type Anchor = { text: string; x: number; y: number };

const CHIP_W = 84;
const POP_W = 320;

function inExempt(node: Node | null): boolean {
  let el = node instanceof Element ? node : node?.parentElement ?? null;
  while (el) {
    if (el.hasAttribute?.('data-ask-exempt')) return true;
    const tag = el.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || el.getAttribute('contenteditable') === 'true') return true;
    el = el.parentElement;
  }
  return false;
}

export default function SelectionAsk({ onAsk }: { onAsk: (quote: string, question: string) => void }) {
  const [chip, setChip] = useState<Anchor | null>(null);
  const [asking, setAsking] = useState<Anchor | null>(null);
  const [q, setQ] = useState('');
  const [showQuote, setShowQuote] = useState(false);
  const field = useRef<HTMLInputElement>(null);
  const pop = useRef<HTMLDivElement>(null);

  const read = useCallback(() => {
    const s = window.getSelection();
    if (!s || s.isCollapsed || s.rangeCount === 0) return setChip(null);
    const text = s.toString().trim();
    if (text.length < 2 || inExempt(s.anchorNode)) return setChip(null);
    const r = s.getRangeAt(0).getBoundingClientRect();
    if (!r.width && !r.height) return setChip(null);
    setChip({ text, x: r.left + r.width / 2, y: r.top });
  }, []);

  useEffect(() => {
    function up() {
      window.setTimeout(read, 0);
    }
    document.addEventListener('mouseup', up);
    document.addEventListener('keyup', up);
    return () => {
      document.removeEventListener('mouseup', up);
      document.removeEventListener('keyup', up);
    };
  }, [read]);

  useEffect(() => {
    if (!asking) return;
    field.current?.focus();
    function away(e: MouseEvent) {
      if (!pop.current?.contains(e.target as Node)) close();
    }
    function esc(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', esc);
    return () => {
      document.removeEventListener('mousedown', away);
      document.removeEventListener('keydown', esc);
    };
  }, [asking]);

  function close() {
    setAsking(null);
    setQ('');
    setShowQuote(false);
  }

  function open() {
    if (!chip) return;
    setAsking(chip);
    setChip(null);
    window.getSelection()?.removeAllRanges();
  }

  function send() {
    if (!asking || !q.trim()) return;
    onAsk(asking.text, q.trim());
    close();
  }

  const clamp = (x: number, w: number) => Math.min(Math.max(x - w / 2, 10), window.innerWidth - w - 10);

  return (
    <>
      {chip && (
        <button
          className="ask-chip"
          style={{ left: clamp(chip.x, CHIP_W), top: Math.max(chip.y - 38, 8) }}
          onMouseDown={(e) => e.preventDefault()}
          onClick={open}
        >
          <Spark size={13} />
          Ask AI
        </button>
      )}

      {asking && (
        <div
          className="ask-pop"
          data-ask-exempt
          ref={pop}
          style={{ left: clamp(asking.x, POP_W), top: Math.max(asking.y - 30, 8), width: POP_W }}
        >
          <button className={`ask-quote ${showQuote ? 'is-open' : ''}`} onClick={() => setShowQuote(!showQuote)}>
            <Chevron size={12} className={showQuote ? '' : 'is-shut'} />
            <span className="ask-quote-t">{asking.text}</span>
          </button>

          <div className="ask-field">
            <input
              ref={field}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder="Ask away"
            />
            <button className="ask-send" onClick={send} disabled={!q.trim()} title="Send to the copilot">
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
