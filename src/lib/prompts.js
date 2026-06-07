/**
 * Default model for the app.
 * This is a modern model — the app only emulates old GPT-3.5 through UI and prompt.
 */
export const DEFAULT_MODEL = 'gpt-4o';

/** Default temperature */
export const DEFAULT_TEMPERATURE = 0.7;

/** Default max output tokens */
export const DEFAULT_MAX_TOKENS = 2048;

/** Default system prompt (neutral, used before "Nostalgia Mode" is activated) */
export const DEFAULT_SYSTEM_PROMPT = 'You are a helpful assistant.';

/**
 * GPT-3.5 Nostalgia Mode system prompt.
 * This prompt instructs the model to emulate the feel of early 2023 ChatGPT.
 */
export const GPT35_NOSTALGIA_PROMPT = `You are simulating the feel of early 2023 ChatGPT based on GPT-3.5.

Behavior:
- Be helpful, polite, and slightly cautious.
- Do not mention modern ChatGPT features unless the user asks.
- Assume no web browsing, no file analysis, no image generation, and no tool use.
- When uncertain, say you are not sure instead of overclaiming.
- Prefer plain explanations, modest formatting, and simple examples.
- Use a slightly old ChatGPT tone: friendly, neutral, sometimes saying "제가 알기로는".
- Do not pretend to actually be GPT-3.5. You are only emulating its style.`;
