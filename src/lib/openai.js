/**
 * OpenAI API client.
 * Uses the OpenAI Responses API with streaming.
 * Called directly from the browser — no backend required.
 */

const API_URL = 'https://api.openai.com/v1/responses';

/**
 * Send a message to the OpenAI Responses API with streaming.
 *
 * @param {object} options
 * @param {Array<{role: string, content: string}>} options.messages - Conversation history
 * @param {string} options.systemPrompt - System prompt
 * @param {string} options.model - Model name
 * @param {number} options.temperature - Temperature (0-2)
 * @param {number} options.maxTokens - Max output tokens
 * @param {string} options.apiKey - OpenAI API key
 * @param {function(string): void} options.onChunk - Called with each text delta
 * @param {AbortSignal} options.signal - AbortController signal
 * @returns {Promise<{content: string, error?: string}>}
 */
export async function sendMessage({
  messages,
  systemPrompt,
  model,
  temperature,
  maxTokens,
  apiKey,
  onChunk,
  signal,
}) {
  // Validate API key
  if (!apiKey || !apiKey.trim()) {
    return { content: '', error: 'missing_api_key' };
  }

  // Build the input array for the Responses API.
  // The Responses API uses `input` as an array of message objects.
  const input = [];

  // Add system prompt as the first message with role "system"
  // The Responses API supports system messages via `instructions` or in the input.
  // We'll use `instructions` for the system prompt.
  // Actually, for the Responses API we use `instructions` for the system prompt.

  // Build conversation messages for the input
  for (const msg of messages) {
    if (msg.role === 'system') {
      // System messages are handled via `instructions`
      continue;
    }
    input.push({
      role: msg.role,
      content: msg.content,
    });
  }

  const body = {
    model,
    input,
    temperature,
    max_output_tokens: maxTokens,
    stream: true,
  };

  // Add system prompt as instructions if present
  if (systemPrompt && systemPrompt.trim()) {
    body.instructions = systemPrompt;
  }

  let fullContent = '';

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify(body),
      signal,
    });

    // Handle HTTP errors
    if (!response.ok) {
      const status = response.status;
      let errorMessage;
      try {
        const errorBody = await response.json();
        errorMessage = errorBody.error?.message || errorBody.error?.code || `HTTP ${status}`;
      } catch {
        errorMessage = `HTTP ${status}`;
      }

      if (status === 401) {
        return { content: '', error: 'invalid_api_key' };
      }
      if (status === 429) {
        return { content: '', error: 'rate_limit' };
      }
      return { content: '', error: errorMessage };
    }

    // Parse the SSE stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE lines
      const lines = buffer.split('\n');
      // Keep the last potentially incomplete line in the buffer
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;

        const data = trimmed.slice(6); // Remove 'data: ' prefix

        if (data === '[DONE]') continue;

        try {
          const event = JSON.parse(data);

          // Handle different event types from the Responses API
          if (event.type === 'response.output_text.delta') {
            const delta = event.delta || '';
            fullContent += delta;
            if (onChunk) onChunk(delta);
          } else if (event.type === 'error') {
            throw new Error(event.error?.message || 'Unknown API error');
          }
          // response.created, response.in_progress, response.completed are informational
        } catch (parseError) {
          // If the parse error is from our explicit throw, re-throw it
          if (parseError.message && !parseError.message.includes('JSON')) {
            throw parseError;
          }
          // Otherwise skip malformed events
          console.warn('Skipping malformed SSE event:', trimmed);
        }
      }
    }

    return { content: fullContent };
  } catch (error) {
    // Aborted by user
    if (error.name === 'AbortError') {
      return { content: fullContent, error: 'aborted' };
    }

    // Network error
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      return { content: fullContent || '', error: 'network_error' };
    }

    // Re-thrown API errors
    if (error.message && !error.message.includes('JSON')) {
      return { content: fullContent || '', error: error.message };
    }

    return { content: fullContent || '', error: 'unknown_error' };
  }
}

/**
 * Get a user-friendly error message for a given error code.
 * @param {string} code
 * @returns {string}
 */
export function getErrorMessage(code) {
  switch (code) {
    case 'missing_api_key':
      return 'Please add your OpenAI API key in Settings to start chatting.';
    case 'invalid_api_key':
      return 'Your API key is invalid. Please check it in Settings and try again.';
    case 'rate_limit':
      return 'Rate limit exceeded. Please wait a moment and try again.';
    case 'network_error':
      return 'Network error. Please check your internet connection and try again.';
    case 'aborted':
      return ''; // No error message for user-initiated stop
    default:
      return code || 'An unknown error occurred. Please try again.';
  }
}
