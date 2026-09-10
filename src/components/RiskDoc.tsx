import { useState } from 'react';
import { ArrowOut, Check, SrcDoc, X } from './Icons';

/* The write-up anyone can read. It is the same work the bench did, told
   without the vocabulary, and it leaves as a shared doc. */
export default function RiskDoc({ paras, onClose }: { paras: string[]; onClose: () => void }) {
  const [shared, setShared] = useState(false);
  const [copied, setCopied] = useState(false);

  const title = 'Why we are trimming NVDA';
  const link = 'docs.google.com/document/d/1kR7…risk-review';

  function copy() {
    navigator.clipboard?.writeText(`https://${link}`).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="doc-wrap" onClick={onClose}>
      <section className="doc" onClick={(e) => e.stopPropagation()}>
        <header className="doc-head">
          <div className="doc-h">
            <span className="doc-kind">
              <SrcDoc size={15} />
              Shared doc
            </span>
            <span className="doc-sub">Written from the bench · plain English</span>
          </div>
          <button className="icon-btn" onClick={onClose} title="Close">
            <X size={13} />
          </button>
        </header>

        <div className="doc-body">
          <h1>{title}</h1>
          <p className="doc-by">Risk desk · 11 September 2026</p>
          {paras.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        <footer className="doc-foot">
          {shared ? (
            <div className="doc-link">
              <span className="doc-live">
                <Check size={12} />
                Anyone at the firm with the link can comment
              </span>
              <div className="doc-url">
                <span>{link}</span>
                <button className="btn-quiet" onClick={copy}>
                  {copied ? 'Copied' : 'Copy link'}
                </button>
                <button className="btn-quiet">
                  Open
                  <ArrowOut size={11} />
                </button>
              </div>
            </div>
          ) : (
            <>
              <span className="doc-note">Creates the doc in the risk team drive and gives everyone comment access.</span>
              <button className="btn-dark" onClick={() => setShared(true)}>
                <SrcDoc size={13} />
                Create Google Doc
              </button>
            </>
          )}
        </footer>
      </section>
    </div>
  );
}
