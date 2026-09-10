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
