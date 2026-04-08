interface MaterialIconProps {
  name: string;
  filled?: boolean;
  size?: number;
  weight?: number;
  className?: string;
}

export function MaterialIcon({
  name,
  filled = false,
  size = 24,
  weight = 400,
  className = "",
}: MaterialIconProps) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{
        fontSize: size,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}`,
      }}
    >
      {name}
    </span>
  );
}
