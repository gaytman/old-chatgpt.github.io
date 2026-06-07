import { useRef, useEffect, useCallback } from 'react';
import { Menu } from 'lucide-react';
import LandingScreen from './LandingScreen';
import Message from './Message';
import Composer from './Composer';

/**
 * Main chat area.
 * Shows LandingScreen when no messages, otherwise Message list + Composer.
 * Handles scroll behavior.
 */
export default function ChatWindow({
  conversation,
  isGenerating,
  onSend,
  onStop,
  onCopyMessage,
  onRegenerate,
  onEditMessage,
  hasApiKey,
  onToggleSidebar,
}) {
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const isNearBottomRef = useRef(true);

  const messages = conversation?.messages || [];
  const showLanding = messages.length === 0;

  // Track whether user is near the bottom
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const threshold = 100; // px from bottom
    isNearBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
  }, []);

  // Auto-scroll when new content arrives, but only if near bottom
  useEffect(() => {
    if (isNearBottomRef.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Scroll to bottom when conversation changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
    }
  }, [conversation?.id]);

  const handleRegenerate = useCallback(() => {
    if (onRegenerate) onRegenerate();
  }, [onRegenerate]);

  return (
    <div className="chat-window">
      {/* Mobile menu button */}
      <button className="mobile-menu-btn" onClick={onToggleSidebar} aria-label="Open sidebar">
        <Menu size={20} />
      </button>

      {showLanding ? (
        <LandingScreen />
      ) : (
        <div className="messages-container" ref={scrollContainerRef} onScroll={handleScroll}>
          {messages.map((msg) => (
            <Message
              key={msg.id}
              message={msg}
              isStreaming={msg.status === 'streaming'}
              onCopy={onCopyMessage}
              onRegenerate={
                msg.role === 'assistant' &&
                msg === messages[messages.length - 1]
                  ? handleRegenerate
                  : undefined
              }
              onEdit={
                msg.role === 'user' ? onEditMessage : undefined
              }
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      <Composer
        onSend={onSend}
        onStop={onStop}
        isGenerating={isGenerating}
        hasApiKey={hasApiKey}
      />
    </div>
  );
}
