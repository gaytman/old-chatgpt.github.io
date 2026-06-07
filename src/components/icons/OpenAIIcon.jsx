/**
 * A simple monochrome inline SVG icon inspired by the OpenAI logomark.
 * Accepts size, className, and title props. Uses currentColor.
 */
export default function OpenAIIcon({ size = 18, className = '', title = 'OpenAI' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role="img"
      aria-label={title}
    >
      <title>{title}</title>
      {/* Interlocking hexagon pattern inspired by the OpenAI mark */}
      <path d="M12 2L6 5.5v7L12 16l6-3.5v-7L12 2z" />
      <path d="M6 19.5L12 23l6-3.5v-7L12 9l-6 3.5v7z" />
      <path d="M6 12.5v-7M18 12.5v-7" opacity="0.5" />
    </svg>
  );
}
