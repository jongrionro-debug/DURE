export function BrandMark({
  className = "h-[48px] w-[52px]",
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <div className={`relative shrink-0 flex items-center justify-center ${className}`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
        <path d="M 25 15 L 50 15 C 75 15 90 30 90 50 C 90 70 75 85 50 85 L 25 85 Z" fill="var(--color-accent)" />
        <path d="M 45 35 L 50 35 C 65 35 70 42 70 50 C 70 58 65 65 50 65 L 45 65 Z" fill="var(--color-surface)" />
        <circle cx="35" cy="50" r="6" fill="var(--color-surface)" />
      </svg>
    </div>
  );
}
