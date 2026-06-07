import { useState, useRef, useCallback, useEffect } from 'react';
import { Send, Square } from 'lucide-react';

/**
 * Fixed bottom input area.
 * Auto-resizing textarea, send/stop button, footer text.
 */
export default function Composer({
  onSend,
  onStop,
  isGenerating,
  hasApiKey,
}) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea
  const adjustHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, window.innerHeight * 0.3) + 'px';
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [input, adjustHeight]);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isGenerating || !hasApiKey) return;
    onSend(trimmed);
    setInput('');
  }, [input, isGenerating, hasApiKey, onSend]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const canSend = input.trim().length > 0 && hasApiKey && !isGenerating;

  return (
    <div className="composer">
      <div className="composer-inner">
        <div className="composer-box">
          <textarea
            ref={textareaRef}
            className="composer-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={hasApiKey ? 'Send a message.' : 'Add your API key in Settings to start.'}
            rows={1}
            disabled={isGenerating}
          />
          {isGenerating ? (
            <button
              className="composer-btn stop-btn"
              onClick={onStop}
              aria-label="Stop generating"
            >
              <Square size={16} fill="currentColor" />
            </button>
          ) : (
            <button
              className={`composer-btn send-btn ${!canSend ? 'disabled' : ''}`}
              onClick={handleSend}
              disabled={!canSend}
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          )}
        </div>
        <p className="composer-footer">
          ChatGPT Mar 14 Version. Free Research Preview.
          Our goal is to make AI systems more natural and safe to interact with.
          Your feedback will help us improve.
        </p>
      </div>
    </div>
  );
}
