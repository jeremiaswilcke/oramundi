interface OraMundiLogoProps {
  size?: number;
  className?: string;
}

export function OraMundiLogo({ size = 32, className }: OraMundiLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Rose spiral */}
      <path
        d="M16 16c0-4 3-7 6-7s6 3 6 7-6 12-12 12-12-6-12-14 6-12 14-12"
        stroke="var(--ora-green)"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Light accent */}
      <circle cx="24" cy="10" r="3" fill="var(--ora-orange)" fillOpacity="0.7" />
      {/* Heart center */}
      <circle cx="16" cy="16" r="2" fill="var(--ora-clay)" />
    </svg>
  );
}
