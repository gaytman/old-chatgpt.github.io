/**
 * Renders the existing /asset/chatgpt-icon.svg as an img.
 * The SVG already has a green square (#74aa9c) background with the OpenAI logo in white.
 * Sharp square corners — no border-radius.
 */
export default function ChatGPTAvatar({ size = 30, className = '', title = 'ChatGPT' }) {
  return (
    <img
      className={`chatgpt-avatar-img ${className}`}
      src="/asset/chatgpt-icon.svg"
      alt={title}
      width={size}
      height={size}
      draggable={false}
    />
  );
}
