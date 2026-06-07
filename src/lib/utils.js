/**
 * Generate a unique ID.
 * Uses crypto.randomUUID if available, otherwise falls back to a simple random string.
 */
export function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers
  return 'id_' + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

/**
 * Truncate text to create a conversation title from the first user message.
 * @param {string} text - The text to truncate
 * @param {number} max - Maximum characters (default 40)
 * @returns {string} Truncated title
 */
export function truncateTitle(text, max = 40) {
  if (!text) return 'New chat';
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return trimmed.substring(0, max).trimEnd() + '…';
}

/**
 * Format a timestamp into a human-readable date string.
 * @param {number} ts - Unix timestamp in milliseconds
 * @returns {string} Formatted date
 */
export function formatDate(ts) {
  if (!ts) return '';
  const date = new Date(ts);
  const now = new Date();
  const diff = now - date;

  // Less than 24 hours: show time
  if (diff < 24 * 60 * 60 * 1000) {
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }
  // Less than 7 days: show day name
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    return date.toLocaleDateString(undefined, { weekday: 'short' });
  }
  // Otherwise: show date
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Combine class names, filtering out falsy values.
 * @param  {...(string|boolean|undefined|null)} args
 * @returns {string}
 */
export function classNames(...args) {
  return args.filter(Boolean).join(' ');
}

/**
 * Debounce a function.
 * @param {Function} fn
 * @param {number} delay - milliseconds
 * @returns {Function}
 */
export function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}
