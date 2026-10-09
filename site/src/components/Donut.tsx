/** Бублик, drawn from scratch: the page's mascot when no screenshots are available. */
export function Donut({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label="Бублик, ведущий игры" className={className}>
      <ellipse cx="100" cy="182" rx="62" ry="9" fill="#1b1033" opacity="0.35" />
      <circle cx="100" cy="100" r="78" fill="#e8a25a" stroke="#1b1033" strokeWidth="7" />
      <path
        d="M24 96c4-44 38-70 76-70s72 26 76 70c-12-10-20 0-30-2-10 8-18 4-26 12-10-8-16 2-26-4-10 6-16-4-26 4-8-8-16-4-26-12-10 2-18-8-18 2z"
        fill="#ff4f8b"
        stroke="#1b1033"
        strokeWidth="7"
        strokeLinejoin="round"
      />
      <circle cx="100" cy="82" r="20" fill="#2a1458" stroke="#1b1033" strokeWidth="6" />
      <g strokeWidth="6" strokeLinecap="round">
        <path d="M56 70l8-4" stroke="#ffd23f" />
        <path d="M140 66l8 5" stroke="#22d3ee" />
        <path d="M70 52l7 5" stroke="#fff" />
        <path d="M126 50l6-6" stroke="#ffd23f" />
        <path d="M48 92l9 1" stroke="#2ed47a" />
        <path d="M150 92l9-2" stroke="#fff" />
      </g>
      <circle cx="74" cy="132" r="7" fill="#1b1033" />
      <circle cx="126" cy="132" r="7" fill="#1b1033" />
      <circle cx="68" cy="146" r="9" fill="#ff4f8b" opacity="0.55" />
      <circle cx="132" cy="146" r="9" fill="#ff4f8b" opacity="0.55" />
      <path d="M86 150q14 12 28 0" fill="none" stroke="#1b1033" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}
