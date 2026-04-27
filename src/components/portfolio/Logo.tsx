export function Logo({
  className,
  height = 22,
}: {
  className?: string;
  height?: number;
}) {
  return (
    <svg
      width={height * (1000 / 485)}
      height={height}
      viewBox="0 0 1000 485"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Sunday"
    >
      <path
        d="M31.0001 484.501L515.5 0.00122034L602.017 86.5189L653.928 138.43L567.41 224.947L515.5 173.037L342.464 346.072L861.571 346.072L999.999 484.501H31.0001Z"
        fill="currentColor"
      />
    </svg>
  );
}
