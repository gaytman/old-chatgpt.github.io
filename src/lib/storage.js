import {
  DEFAULT_MODEL,
  DEFAULT_TEMPERATURE,
  DEFAULT_MAX_TOKENS,
  DEFAULT_SYSTEM_PROMPT,
} from './prompts';

const CONVERSATIONS_KEY = 'chatgpt-conversations';
const SETTINGS_KEY = 'chatgpt-settings';

/**
 * Safely parse JSON. Returns fallback if parsing fails.
 * @param {string} json
 * @param {*} fallback
 * @returns {*}
 */
function safeParse(json, fallback) {
  try {
    const parsed = JSON.parse(json);
    if (fallback !== undefined) {
      if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback;
      if (typeof fallback === 'object' && fallback !== null && !Array.isArray(fallback)) {
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return fallback;
      }
    }
    return parsed;
  } catch {
    return fallback;
  }
}

// ─── Conversations ────────────────────────────────────────────────

/** @returns {import('./utils').Conversation[]} */
export function loadConversations() {
  const raw = localStorage.getItem(CONVERSATIONS_KEY);
  return safeParse(raw, []);
}

/** @param {import('./utils').Conversation[]} conversations */
export function saveConversations(conversations) {
  try {
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
  } catch (e) {
    // localStorage full or unavailable — silently fail
    console.warn('Failed to save conversations:', e);
  }
}

/** @param {string} id */
export function deleteConversationFromStorage(id) {
  const conversations = loadConversations();
  const filtered = conversations.filter((c) => c.id !== id);
  saveConversations(filtered);
}

// ─── Settings ─────────────────────────────────────────────────────

/** @returns {object} */
export function loadSettings() {
  const raw = localStorage.getItem(SETTINGS_KEY);
  const defaults = {
    apiKey: '',
    model: DEFAULT_MODEL,
    temperature: DEFAULT_TEMPERATURE,
    maxTokens: DEFAULT_MAX_TOKENS,
    systemPrompt: DEFAULT_SYSTEM_PROMPT,
    theme: 'dark',
  };
  const parsed = safeParse(raw, {});
  return { ...defaults, ...parsed };
}

/** @param {object} settings */
export function saveSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings:', e);
  }
}

// ─── Clear All ────────────────────────────────────────────────────

export function clearAllData() {
  localStorage.removeItem(CONVERSATIONS_KEY);
  localStorage.removeItem(SETTINGS_KEY);
}
