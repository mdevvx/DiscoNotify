export function PulseMark({ size = 30 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="var(--signal)" />
      <path
        d="M5 17h5l2.5-6 4 11 3-8 1.5 3H27"
        fill="none"
        stroke="#fff"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PulseLine() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path
        d="M3 17h6l2.5-6 4 11 3-8 1.5 3H29"
        fill="none"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
