export function Doodles() {
  return (
    <div className="hero-doodles" aria-hidden="true">
      {/* Envelope - top left */}
      <svg className="doodle doodle-envelope" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="8" y="16" width="48" height="32" rx="4" />
        <polyline points="8,16 32,36 56,16" />
      </svg>

      {/* Paper plane - top right */}
      <svg className="doodle doodle-plane" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 32L60 4L44 32L60 60L4 32z" />
        <line x1="44" y1="32" x2="20" y2="44" />
      </svg>

      {/* At symbol - bottom left */}
      <svg className="doodle doodle-at" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <circle cx="32" cy="32" r="10" />
        <path d="M42 32a10 10 0 0 0-10-10" />
        <path d="M32 22a20 20 0 0 1 20 20" />
      </svg>

      {/* Checkmark - middle right */}
      <svg className="doodle doodle-check" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="32" cy="32" r="24" />
        <polyline points="22,32 30,40 44,24" />
      </svg>

      {/* Code brackets - bottom right */}
      <svg className="doodle doodle-code" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20,16 8,32 20,48" />
        <polyline points="44,16 56,32 44,48" />
        <line x1="36" y1="12" x2="28" y2="52" />
      </svg>

      {/* Sparkle dots */}
      <div className="doodle doodle-dots">
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
        <span className="dot" />
      </div>

      {/* Plus signs */}
      <svg className="doodle doodle-plus" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <line x1="32" y1="16" x2="32" y2="48" />
        <line x1="16" y1="32" x2="48" y2="32" />
      </svg>

      {/* Mail with notification */}
      <svg className="doodle doodle-mail-badge" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="12" width="40" height="28" rx="4" />
        <polyline points="4,12 24,28 44,12" />
        <circle cx="50" cy="10" r="10" fill="currentColor" stroke="none" opacity="0.15" />
        <text x="50" y="14" textAnchor="middle" fill="currentColor" fontSize="12" fontWeight="bold" stroke="none">!</text>
      </svg>
    </div>
  );
}
