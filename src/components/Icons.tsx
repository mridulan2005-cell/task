type P = { size?: number; className?: string };

const base = (size: number, className?: string) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className,
  'aria-hidden': true,
});

export const Plus = ({ size = 16, className }: P) => (
  <svg {...base(size, className)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const Grid = ({ size = 18, className }: P) => (
  <svg {...base(size, className)}>
    <rect x="3.5" y="3.5" width="7" height="7" rx="1.6" />
    <rect x="13.5" y="3.5" width="7" height="7" rx="1.6" />
    <rect x="3.5" y="13.5" width="7" height="7" rx="1.6" />
    <rect x="13.5" y="13.5" width="7" height="7" rx="1.6" />
  </svg>
);

export const Bookmark = ({ size = 18, className }: P) => (
  <svg {...base(size, className)}>
    <path d="M6 4.5h12v15l-6-4-6 4z" />
  </svg>
);

export const Agents = ({ size = 18, className }: P) => (
  <svg {...base(size, className)}>
    <circle cx="12" cy="6" r="2.6" />
    <circle cx="5.6" cy="17.4" r="2.6" />
    <circle cx="18.4" cy="17.4" r="2.6" />
    <path d="M10.2 7.9 7.3 15M13.8 7.9 16.7 15M8.2 17.4h7.6" />
  </svg>
);

export const Book = ({ size = 18, className }: P) => (
  <svg {...base(size, className)}>
    <path d="M5 4.5h9.5A2.5 2.5 0 0 1 17 7v12.5H7.5A2.5 2.5 0 0 1 5 17z" />
    <path d="M19 4.5v15" />
  </svg>
);

export const Gear = ({ size = 18, className }: P) => (
  <svg {...base(size, className)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 14.5a1.5 1.5 0 0 0 .3 1.7l.1.1a1.8 1.8 0 1 1-2.6 2.6l-.1-.1a1.5 1.5 0 0 0-2.6 1.1v.2a1.8 1.8 0 1 1-3.6 0v-.1a1.5 1.5 0 0 0-2.6-1.1l-.1.1a1.8 1.8 0 1 1-2.6-2.6l.1-.1a1.5 1.5 0 0 0-1.1-2.6h-.2a1.8 1.8 0 1 1 0-3.6h.1a1.5 1.5 0 0 0 1.1-2.6l-.1-.1a1.8 1.8 0 1 1 2.6-2.6l.1.1a1.5 1.5 0 0 0 1.7.3h.1a1.5 1.5 0 0 0 .9-1.4v-.2a1.8 1.8 0 1 1 3.6 0v.1a1.5 1.5 0 0 0 2.6 1.1l.1-.1a1.8 1.8 0 1 1 2.6 2.6l-.1.1a1.5 1.5 0 0 0 1.1 2.6h.2a1.8 1.8 0 1 1 0 3.6h-.1a1.5 1.5 0 0 0-1.4.9z" />
  </svg>
);

export const Exit = ({ size = 18, className }: P) => (
  <svg {...base(size, className)}>
    <path d="M14 4.5H6.5A1.5 1.5 0 0 0 5 6v12a1.5 1.5 0 0 0 1.5 1.5H14" />
    <path d="M17 15.5 20.5 12 17 8.5M20 12h-9" />
  </svg>
);

export const Panel = ({ size = 18, className }: P) => (
  <svg {...base(size, className)}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2.2" />
    <path d="M10 4.5v15" />
  </svg>
);

export const Search = ({ size = 16, className }: P) => (
  <svg {...base(size, className)}>
    <circle cx="11" cy="11" r="6.2" />
    <path d="m20 20-3.6-3.6" />
  </svg>
);

export const Bell = ({ size = 17, className }: P) => (
  <svg {...base(size, className)}>
    <path d="M18 9a6 6 0 1 0-12 0c0 5-2 6-2 6h16s-2-1-2-6" />
    <path d="M13.7 19a2 2 0 0 1-3.4 0" />
  </svg>
);

export const Chevron = ({ size = 14, className }: P) => (
  <svg {...base(size, className)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export const Spark = ({ size = 15, className }: P) => (
  <svg {...base(size, className)}>
    <path d="M12 3.5 13.9 9l5.6 2-5.6 2-1.9 5.5L10.1 13 4.5 11l5.6-2z" />
  </svg>
);

export const Clip = ({ size = 15, className }: P) => (
  <svg {...base(size, className)}>
    <path d="M20 11.5 12.5 19a4.6 4.6 0 0 1-6.5-6.5l7.8-7.8a3 3 0 0 1 4.3 4.3l-7.8 7.8a1.5 1.5 0 0 1-2.1-2.1l7.2-7.2" />
  </svg>
);

export const X = ({ size = 13, className }: P) => (
  <svg {...base(size, className)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);

export const Send = ({ size = 15, className }: P) => (
  <svg {...base(size, className)}>
    <path d="M5 12h13M12.5 6.5 19 12l-6.5 5.5" />
  </svg>
);

export const Alert = ({ size = 13, className }: P) => (
  <svg {...base(size, className)}>
    <path d="M12 4.8 3.6 19h16.8z" />
    <path d="M12 10v4M12 16.6v.4" />
  </svg>
);

export const ArrowOut = ({ size = 13, className }: P) => (
  <svg {...base(size, className)}>
    <path d="M8 16 16 8M9.5 8H16v6.5" />
  </svg>
);

export const Filter = ({ size = 14, className }: P) => (
  <svg {...base(size, className)}>
    <path d="M4 6h16M7 12h10M10 18h4" />
  </svg>
);

export const Mark = ({ size = 20, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <rect width="24" height="24" rx="6" fill="#111213" />
    <path d="M6.5 15.5 10 8.5l3 4.6 1.6-2.4 3 4.8" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Left = ({ size = 16, className }: P) => (
  <svg {...base(size, className)}>
    <path d="m14 6-6 6 6 6" />
  </svg>
);

export const Pencil = ({ size = 15, className }: P) => (
  <svg {...base(size, className)}>
    <path d="M4.5 19.5h3l9.6-9.6a2.1 2.1 0 0 0-3-3L4.5 16.5z" />
    <path d="m13.6 6.4 4 4" />
  </svg>
);

export const Check = ({ size = 14, className }: P) => (
  <svg {...base(size, className)}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

export const Info = ({ size = 16, className }: P) => (
  <svg {...base(size, className)}>
    <circle cx="12" cy="12" r="8.4" />
    <path d="M12 11v5M12 8.2v.3" />
  </svg>
);

/* Source-type glyphs. Colour is baked in so a list of mixed sources reads
   the way a file list does, not like a row of identical bullets. */

export const SrcDoc = ({ size = 16 }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="2.5" y="1.5" width="11" height="13" rx="1.8" fill="#4285f4" />
    <path d="M5.4 5.6h5.2M5.4 8h5.2M5.4 10.4h3.4" stroke="#fff" strokeWidth="1.1" strokeLinecap="round" />
  </svg>
);

export const SrcSheet = ({ size = 16 }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="2.5" y="1.5" width="11" height="13" rx="1.8" fill="#0f9d58" />
    <path d="M5.2 6.2h5.6M5.2 9.2h5.6M8 4.6v7.2" stroke="#fff" strokeWidth="1.1" />
  </svg>
);

export const SrcRepo = ({ size = 16 }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <circle cx="8" cy="8" r="6.6" fill="#111213" />
    <path d="M6.4 5.9 4.7 8l1.7 2.1M9.6 5.9 11.3 8l-1.7 2.1" stroke="#fff" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const SrcDrive = ({ size = 16 }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M6.1 2h3.8l4.1 7.1-1.9 3.3z" fill="#ffc107" />
    <path d="M6.1 2 2 9.1 3.9 12.4 10 2z" fill="#1976d2" />
    <path d="M2 9.1h12l-1.9 3.3H3.9z" fill="#4caf50" />
  </svg>
);

export const SrcChat = ({ size = 16 }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M2.4 7.3a4.9 4.9 0 0 1 5-4.8h1.2a4.9 4.9 0 0 1 0 9.7H6.1l-3 2.3.5-2.6a4.9 4.9 0 0 1-1.2-3.2z" fill="#7c5cd6" />
  </svg>
);

export const SrcFeed = ({ size = 16 }: P) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <rect x="2" y="2.5" width="12" height="11" rx="2" fill="#5b6067" />
    <path d="M4.8 6.2 6.6 8l-1.8 1.8M8.4 10.2h3" stroke="#fff" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const Lock = ({ size = 12, className }: P) => (
  <svg {...base(size, className)}>
    <rect x="5" y="10.5" width="14" height="9.5" rx="2.2" />
    <path d="M8.2 10.5V7.8a3.8 3.8 0 0 1 7.6 0v2.7" />
  </svg>
);

export const FileDash = ({ size = 15, className }: P) => (
  <svg {...base(size, className)}>
    <path d="M8 3.5H6.5A1.5 1.5 0 0 0 5 5v1.5" strokeDasharray="3 2.4" />
    <path d="M5 9.5v5" strokeDasharray="3 2.4" />
    <path d="M5 17.5V19a1.5 1.5 0 0 0 1.5 1.5H8" strokeDasharray="3 2.4" />
    <path d="M11 20.5h6.5A1.5 1.5 0 0 0 19 19V9l-5.5-5.5H11" strokeDasharray="3 2.4" />
  </svg>
);

export const Box = ({ size = 14, className }: P) => (
  <svg {...base(size, className)}>
    <rect x="4.5" y="4.5" width="15" height="15" rx="3.4" />
  </svg>
);

export const Calendar = ({ size = 14, className }: P) => (
  <svg {...base(size, className)}>
    <rect x="3.5" y="5.5" width="17" height="15" rx="2.4" />
    <path d="M3.5 10h17M8 3.5v4M16 3.5v4" />
  </svg>
);

export const Nodes = ({ size = 15, className }: P) => (
  <svg {...base(size, className)}>
    <rect x="2.6" y="9" width="6" height="6" rx="1.6" />
    <rect x="15.4" y="3.4" width="6" height="6" rx="1.6" />
    <rect x="15.4" y="14.6" width="6" height="6" rx="1.6" />
    <path d="M8.6 11.4h2.6a1.8 1.8 0 0 0 1.8-1.8V8.2a1.8 1.8 0 0 1 1.8-1.8h0.6M8.6 12.6h2.6a1.8 1.8 0 0 1 1.8 1.8v1.4a1.8 1.8 0 0 0 1.8 1.8h0.6" />
  </svg>
);

export const Eye = ({ size = 18, className }: P) => (
  <svg {...base(size, className)}>
    <path d="M2.4 12s3.6-6.4 9.6-6.4S21.6 12 21.6 12s-3.6 6.4-9.6 6.4S2.4 12 2.4 12z" />
    <circle cx="12" cy="12" r="2.6" />
  </svg>
);

export const Fx = ({ size = 13, className }: P) => (
  <svg {...base(size, className)}>
    <path d="M4.5 20V8.2a3.2 3.2 0 0 1 3.2-3.2h1.1M3.4 12h6.6" />
    <path d="M13.4 12.4l6.2 7M19.6 12.4l-6.2 7" />
  </svg>
);

export const Trash = ({ size = 13, className }: P) => (
  <svg {...base(size, className)}>
    <path d="M4.6 6.6h14.8M9.4 6.6V4.8h5.2v1.8M6.4 6.6l.9 12.2a1.6 1.6 0 0 0 1.6 1.5h6.2a1.6 1.6 0 0 0 1.6-1.5l.9-12.2" />
  </svg>
);

export const Target = ({ size = 15, className }: P) => (
  <svg {...base(size, className)}>
    <circle cx="12" cy="12" r="8.2" />
    <circle cx="12" cy="12" r="3.4" />
    <path d="M12 1.8v2.4M12 19.8v2.4M1.8 12h2.4M19.8 12h2.4" />
  </svg>
);

export const FileText = ({ size = 20, className }: P) => (
  <svg {...base(size, className)}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5M9 13h6M9 17h4" />
  </svg>
);

export const Image = ({ size = 20, className }: P) => (
  <svg {...base(size, className)}>
    <rect x="4" y="4" width="16" height="16" rx="2.5" />
    <circle cx="9.5" cy="9.5" r="1.4" />
    <path d="M20 15.5 15.5 11 5 20" />
  </svg>
);

export const Upload = ({ size = 16, className }: P) => (
  <svg {...base(size, className)}>
    <path d="M12 16V4M8 8l4-4 4 4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
  </svg>
);

export const Plug = ({ size = 16, className }: P) => (
  <svg {...base(size, className)}>
    <path d="M9 3v6M15 3v6M7 9h10v3a5 5 0 0 1-10 0zM12 17v4" />
  </svg>
);

export const Edge = ({ size = 16, className }: P) => (
  <svg {...base(size, className)}>
    <circle cx="6" cy="18" r="2.4" />
    <circle cx="18" cy="6" r="2.4" />
    <path d="M7.7 16.3 16.3 7.7M6 15.6V9a3 3 0 0 1 3-3h6.6" />
  </svg>
);

export const Corner = ({ size = 14, className }: P) => (
  <svg {...base(size, className)}>
    <path d="M5 5v8a3 3 0 0 0 3 3h11M15 12l4 4-4 4" />
  </svg>
);

/* ---------------- dashboard widgets ---------------- */

/* The grip a widget is dragged by. Dots, so it reads as a handle and not a
   menu the way three dots would. */
export const Grip = ({ size = 14, className }: P) => (
  <svg {...base(size, className)} fill="currentColor" stroke="none">
    <circle cx="9" cy="6" r="1.5" />
    <circle cx="15" cy="6" r="1.5" />
    <circle cx="9" cy="12" r="1.5" />
    <circle cx="15" cy="12" r="1.5" />
    <circle cx="9" cy="18" r="1.5" />
    <circle cx="15" cy="18" r="1.5" />
  </svg>
);

/* The three widths, drawn as the share of a row each one takes. */
export const SpanThird = ({ size = 14, className }: P) => (
  <svg {...base(size, className)}>
    <rect x="3.5" y="6.5" width="5" height="11" rx="1.4" fill="currentColor" stroke="none" />
    <rect x="10" y="6.5" width="5" height="11" rx="1.4" opacity="0.32" />
    <rect x="16.5" y="6.5" width="4" height="11" rx="1.4" opacity="0.32" />
  </svg>
);

export const SpanHalf = ({ size = 14, className }: P) => (
  <svg {...base(size, className)}>
    <rect x="3.5" y="6.5" width="8.5" height="11" rx="1.4" fill="currentColor" stroke="none" />
    <rect x="13.5" y="6.5" width="7" height="11" rx="1.4" opacity="0.32" />
  </svg>
);

export const SpanFull = ({ size = 14, className }: P) => (
  <svg {...base(size, className)}>
    <rect x="3.5" y="6.5" width="17" height="11" rx="1.4" fill="currentColor" stroke="none" />
  </svg>
);

/* Layout: what the customise toggle carries. */
export const Layout = ({ size = 15, className }: P) => (
  <svg {...base(size, className)}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="2.4" />
    <path d="M3.5 9.5h17M11 9.5v11" />
  </svg>
);

/* Undo: reset a layout back to the desk template. */
export const Undo = ({ size = 14, className }: P) => (
  <svg {...base(size, className)}>
    <path d="M4.5 9.5h9.8a5 5 0 0 1 0 10H8.2" />
    <path d="M8 5 4.2 9.5 8 14" />
  </svg>
);

/* ---------------- chat and tasks ---------------- */

export const Chat = ({ size = 16, className }: P) => (
  <svg {...base(size, className)}>
    <path d="M20.4 11.6a8 8 0 0 1-8.6 8 8.6 8.6 0 0 1-3.7-.9L3.6 20l1.3-4.4a8 8 0 0 1-.9-3.7 8 8 0 0 1 8-8.6 8 8 0 0 1 8.4 8.3z" />
  </svg>
);

export const Briefcase = ({ size = 16, className }: P) => (
  <svg {...base(size, className)}>
    <rect x="3" y="7.6" width="18" height="12.4" rx="2.2" />
    <path d="M8.6 7.6V6a1.9 1.9 0 0 1 1.9-1.9h3a1.9 1.9 0 0 1 1.9 1.9v1.6M3 12.6h18" />
  </svg>
);

export const NewChat = ({ size = 16, className }: P) => (
  <svg {...base(size, className)}>
    <path d="M11.4 4.6H6.2A2.2 2.2 0 0 0 4 6.8v11a2.2 2.2 0 0 0 2.2 2.2h11a2.2 2.2 0 0 0 2.2-2.2v-5.2" />
    <path d="M17.2 3.6a1.9 1.9 0 0 1 2.7 2.7L12.6 13.6l-3.4.9.9-3.4z" />
  </svg>
);

export const History = ({ size = 16, className }: P) => (
  <svg {...base(size, className)}>
    <path d="M4 6.5h16M4 12h16M4 17.5h11" />
  </svg>
);

export const Clock = ({ size = 15, className }: P) => (
  <svg {...base(size, className)}>
    <circle cx="12" cy="12" r="8.4" />
    <path d="M12 7.4V12l3.1 1.9" />
  </svg>
);

export const Repeat = ({ size = 14, className }: P) => (
  <svg {...base(size, className)}>
    <path d="M4.5 9.5A4.5 4.5 0 0 1 9 5h10M16.4 2.4 19.5 5l-3.1 2.6" />
    <path d="M19.5 14.5A4.5 4.5 0 0 1 15 19H5M7.6 21.6 4.5 19l3.1-2.6" />
  </svg>
);

/* The agent that decides rather than produces, and the record it leaves. */
export const Scales = ({ size = 17, className }: P) => (
  <svg {...base(size, className)}>
    <path d="M12 4.4v15.2M7.4 19.6h9.2M4.6 7.2 12 5.8l7.4 1.4" />
    <path d="M4.6 7.4 2 13.4a2.9 2.9 0 0 0 5.2 0zM19.4 7.4l-2.6 6a2.9 2.9 0 0 0 5.2 0z" />
  </svg>
);

export const Ledger = ({ size = 15, className }: P) => (
  <svg {...base(size, className)}>
    <rect x="4" y="3.4" width="16" height="17.2" rx="2.2" />
    <path d="M8 3.4v17.2M11 8.4h6M11 12h6M11 15.6h4" />
  </svg>
);

/* A search with a spark on it: what an agent turned up rather than a person. */
export const SearchAi = ({ size = 13, className }: P) => (
  <svg {...base(size, className)}>
    <circle cx="10.6" cy="10.6" r="6.2" />
    <path d="M15.2 15.2 20 20" />
    <path d="M10.6 7.4l.85 2.35 2.35.85-2.35.85-.85 2.35-.85-2.35-2.35-.85 2.35-.85z" />
  </svg>
);

/* What the reading produced: an idea, with the spark that says an agent
   turned it up rather than a person. */
export const Bulb = ({ size = 19, className }: P) => (
  <svg {...base(size, className)}>
    <path d="M9.2 17.4a6.2 6.2 0 1 1 5.6 0v1.9a1.5 1.5 0 0 1-1.5 1.5h-2.6a1.5 1.5 0 0 1-1.5-1.5z" />
    <path d="M9.4 17.6h5.2" />
    <path d="M18.9 3.1l.62 1.72 1.72.62-1.72.62-.62 1.72-.62-1.72-1.72-.62 1.72-.62z" />
  </svg>
);

export const Bars = ({ size = 16, className }: P) => (
  <svg {...base(size, className)}>
    <path d="M5 20V11M12 20V4.6M19 20v-6.4" />
  </svg>
);

/* Stopping a run where it stands, which is a hold rather than a cancel. */
export const Pause = ({ size = 13, className }: P) => (
  <svg {...base(size, className)} fill="currentColor" stroke="none">
    <rect x="8" y="6" width="3.2" height="12" rx="1.3" />
    <rect x="12.8" y="6" width="3.2" height="12" rx="1.3" />
  </svg>
);
