export default function Logo({ size = 32 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="meloraGradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
      </defs>

      {/* Circle background */}
      <circle cx="24" cy="24" r="24" fill="url(#meloraGradient)" />

      {/* Sound wave bars */}
      <rect x="14" y="20" width="3" height="8" rx="1.5" fill="white" />
      <rect x="19.5" y="14" width="3" height="20" rx="1.5" fill="white" />
      <rect x="25" y="10" width="3" height="28" rx="1.5" fill="white" />
      <rect x="30.5" y="16" width="3" height="16" rx="1.5" fill="white" />
      <rect x="36" y="21" width="3" height="6" rx="1.5" fill="white" />
    </svg>
  );
}
