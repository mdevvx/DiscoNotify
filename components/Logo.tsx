export function PulseMark({ size = 30 }: { size?: number }) {
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="var(--signal)" />
      <path
        d="M6.25 16H11.25L13.75 10L17.5 22L20 16H20.9"
        fill="none"
        stroke="#fff"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="25" cy="16" r="1.9" fill="#fff" />
    </svg>
  );
}

export function PulseLine() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path
        d="M6.25 16H11.25L13.75 10L17.5 22L20 16H20.9"
        fill="none"
        stroke="#fff"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="25" cy="16" r="1.9" fill="#fff" />
    </svg>
  );
}
