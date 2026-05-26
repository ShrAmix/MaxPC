// =============================================
// SVG icons for parts (line-style)
// =============================================

const ICONS = {
  case: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="5" y="2.5" width="14" height="19" />
      <line x1="7" y1="5" x2="11" y2="5" />
      <circle cx="17" cy="5" r="0.6" fill="currentColor" />
      <line x1="8" y1="9" x2="8" y2="19" />
      <line x1="10" y1="9" x2="10" y2="19" />
      <line x1="12" y1="9" x2="12" y2="19" />
    </svg>
  ),
  cpu: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="5" y="5" width="14" height="14" />
      <rect x="9" y="9" width="6" height="6" />
      <line x1="2" y1="9" x2="5" y2="9" /><line x1="2" y1="15" x2="5" y2="15" />
      <line x1="19" y1="9" x2="22" y2="9" /><line x1="19" y1="15" x2="22" y2="15" />
      <line x1="9" y1="2" x2="9" y2="5" /><line x1="15" y1="2" x2="15" y2="5" />
      <line x1="9" y1="19" x2="9" y2="22" /><line x1="15" y1="19" x2="15" y2="22" />
    </svg>
  ),
  mobo: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="2" width="20" height="20" />
      <rect x="6" y="5" width="6" height="6" />
      <rect x="15" y="5" width="1.5" height="8" />
      <rect x="17.5" y="5" width="1.5" height="8" />
      <line x1="5" y1="15" x2="19" y2="15" />
      <line x1="5" y1="18" x2="14" y2="18" />
      <circle cx="4" cy="4" r="0.6" fill="currentColor" />
      <circle cx="20" cy="4" r="0.6" fill="currentColor" />
      <circle cx="4" cy="20" r="0.6" fill="currentColor" />
      <circle cx="20" cy="20" r="0.6" fill="currentColor" />
    </svg>
  ),
  gpu: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="8" width="20" height="8" />
      <circle cx="7" cy="12" r="2.5" />
      <circle cx="14" cy="12" r="2.5" />
      <line x1="19" y1="10" x2="21" y2="10" />
      <line x1="19" y1="12" x2="21" y2="12" />
      <line x1="19" y1="14" x2="21" y2="14" />
    </svg>
  ),
  ram: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="6" width="20" height="10" />
      <line x1="5" y1="6" x2="5" y2="16" />
      <line x1="8" y1="6" x2="8" y2="16" />
      <line x1="11" y1="6" x2="11" y2="16" />
      <line x1="14" y1="6" x2="14" y2="16" />
      <line x1="17" y1="6" x2="17" y2="16" />
      <line x1="2" y1="18" x2="22" y2="18" />
      <line x1="4" y1="20" x2="6" y2="20" /><line x1="9" y1="20" x2="11" y2="20" />
      <line x1="14" y1="20" x2="16" y2="20" /><line x1="19" y1="20" x2="20" y2="20" />
    </svg>
  ),
  ssd: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="8" width="18" height="8" rx="0.5" />
      <line x1="7" y1="11" x2="17" y2="11" />
      <line x1="7" y1="13" x2="13" y2="13" />
      <circle cx="18" cy="13" r="0.5" fill="currentColor" />
    </svg>
  ),
  cooler: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="5" y="3" width="14" height="14" />
      <line x1="7" y1="5" x2="7" y2="15" /><line x1="9" y1="5" x2="9" y2="15" />
      <line x1="11" y1="5" x2="11" y2="15" /><line x1="13" y1="5" x2="13" y2="15" />
      <line x1="15" y1="5" x2="15" y2="15" /><line x1="17" y1="5" x2="17" y2="15" />
      <circle cx="12" cy="20" r="2.5" />
    </svg>
  ),
  psu: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="7" width="20" height="10" />
      <circle cx="8" cy="12" r="3" />
      <rect x="14" y="10" width="6" height="4" />
      <line x1="15" y1="11.5" x2="19" y2="11.5" />
      <line x1="15" y1="12.5" x2="19" y2="12.5" />
    </svg>
  ),
  fan: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" />
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="2" />
      <path d="M12 5 Q14 9 12 12" />
      <path d="M19 12 Q15 14 12 12" />
      <path d="M12 19 Q10 15 12 12" />
      <path d="M5 12 Q9 10 12 12" />
    </svg>
  ),
  tim: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="4" y="4" width="16" height="16" />
      <line x1="7" y1="7" x2="17" y2="17" />
      <line x1="17" y1="7" x2="7" y2="17" />
      <line x1="4" y1="12" x2="20" y2="12" strokeDasharray="2 2" />
    </svg>
  ),
};

window.ICONS = ICONS;
