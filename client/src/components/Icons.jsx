const stroke = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

export function BrandMark({ className = '' }) {
  return (
    <span className={`brand-mark ${className}`.trim()} aria-hidden>
      <svg viewBox="0 0 40 40" width="40" height="40">
        <circle cx="20" cy="22" r="7" fill="currentColor" opacity="0.35" />
        <ellipse cx="20" cy="14" rx="5" ry="6" fill="currentColor" opacity="0.9" />
        <ellipse cx="12" cy="18" rx="5" ry="6" fill="currentColor" opacity="0.75" transform="rotate(-35 12 18)" />
        <ellipse cx="28" cy="18" rx="5" ry="6" fill="currentColor" opacity="0.75" transform="rotate(35 28 18)" />
        <ellipse cx="14" cy="26" rx="5" ry="6" fill="currentColor" opacity="0.7" transform="rotate(-70 14 26)" />
        <ellipse cx="26" cy="26" rx="5" ry="6" fill="currentColor" opacity="0.7" transform="rotate(70 26 26)" />
        <circle cx="20" cy="20" r="3.5" fill="#fffde8" />
      </svg>
    </span>
  );
}

const NAV_PATHS = {
  garden: (
    <>
      <path d="M6 18v10h6" {...stroke} />
      <path d="M14 14v14h6" {...stroke} />
      <path d="M22 10v18h6" {...stroke} />
      <circle cx="9" cy="14" r="2.5" fill="currentColor" opacity="0.5" />
      <circle cx="17" cy="10" r="2.5" fill="currentColor" opacity="0.5" />
      <circle cx="25" cy="7" r="2.5" fill="currentColor" opacity="0.5" />
    </>
  ),
  members: (
    <>
      <circle cx="11" cy="11" r="3.5" {...stroke} />
      <circle cx="21" cy="11" r="3.5" {...stroke} />
      <path d="M4 22c0-3.5 3.1-6 7-6s7 2.5 7 6" {...stroke} />
      <path d="M14 22c0-3.5 3.1-6 7-6s7 2.5 7 6" {...stroke} />
    </>
  ),
  profile: (
    <>
      <circle cx="16" cy="11" r="5" {...stroke} />
      <path d="M6 26c0-5 4.5-9 10-9s10 4 10 9" {...stroke} />
    </>
  ),
  flowers: (
    <>
      <circle cx="16" cy="16" r="3" fill="currentColor" opacity="0.4" />
      <ellipse cx="16" cy="10" rx="3.5" ry="4.5" fill="currentColor" opacity="0.85" />
      <ellipse cx="10" cy="14" rx="3.5" ry="4.5" fill="currentColor" opacity="0.7" transform="rotate(-30 10 14)" />
      <ellipse cx="22" cy="14" rx="3.5" ry="4.5" fill="currentColor" opacity="0.7" transform="rotate(30 22 14)" />
      <path d="M16 19v8" {...stroke} />
    </>
  ),
  search: (
    <>
      <circle cx="13" cy="13" r="6.5" {...stroke} />
      <path d="M17.5 17.5L24 24" {...stroke} />
    </>
  ),
};

export function NavIcon({ name, className = '' }) {
  return (
    <svg
      className={`nav-icon-svg ${className}`.trim()}
      viewBox="0 0 32 32"
      width="22"
      height="22"
      aria-hidden
    >
      {NAV_PATHS[name]}
    </svg>
  );
}

export function AuthBloom({ className = '' }) {
  return (
    <div className={`auth-bloom ${className}`.trim()} aria-hidden>
      <BrandMark />
    </div>
  );
}
