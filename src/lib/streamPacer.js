/**
 * Visual stream pacer.
 * Receives text chunks from the API stream and optionally paces how fast
 * they are displayed to the user. This does not change the real API speed —
 * it only controls the visual reveal of already-received text.
 */

/**
 * Create a stream pacer.
 *
 * @param {object} options
 * @param {number} options.delayMs - Delay between character chunks (0 = instant)
 * @param {function(string): void} options.onText - Called with each batch of text to display
 * @param {function(): void} options.onDone - Called when all queued text has been flushed
 * @returns {{ enqueue: function(string): void, finish: function(): void, stop: function(): void }}
 */
export function createStreamPacer({ delayMs, onText, onDone }) {
  let queue = [];
  let timer = null;
  let finished = false;
  let stopped = false;

  function flush() {
    if (stopped) return;
    if (queue.length === 0) {
      if (finished) {
        // All done — notify
        if (onDone) onDone();
      }
      return;
    }

    // Dequeue one chunk and display it
    const chunk = queue.shift();
    if (onText) onText(chunk);

    // Schedule next flush
    if (delayMs > 0) {
      timer = setTimeout(flush, delayMs);
    } else {
      // Instant mode: flush all remaining immediately
      while (queue.length > 0 && !stopped) {
        const next = queue.shift();
        if (onText) onText(next);
      }
      if (finished && !stopped) {
        if (onDone) onDone();
      }
    }
  }

  /**
   * Enqueue a text chunk for paced display.
   * @param {string} text
   */
  function enqueue(text) {
    if (stopped) return;
    queue.push(text);

    // If delay is 0, flush everything synchronously
    if (delayMs === 0) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      while (queue.length > 0 && !stopped) {
        const chunk = queue.shift();
        if (onText) onText(chunk);
      }
      if (finished && !stopped && onDone) {
        onDone();
      }
      return;
    }

    // Start flushing if not already in progress
    if (!timer) {
      timer = setTimeout(flush, delayMs);
    }
  }

  /**
   * Signal that the API stream has finished.
   * The pacer will continue flushing the remaining queue.
   */
  function finish() {
    finished = true;
    if (stopped) return;

    // If nothing is queued and no timer running, we're done immediately
    if (queue.length === 0 && !timer) {
      if (onDone) onDone();
    }
    // Otherwise the existing flush loop will handle finishing
  }

  /**
   * Stop the pacer immediately.
   * Clears the queue and cancels any pending timer.
   */
  function stop() {
    stopped = true;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
    queue = [];
  }

  return { enqueue, finish, stop };
}
