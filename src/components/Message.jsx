import { useState, useCallback, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, RefreshCw, Edit3, User } from 'lucide-react';
import CodeBlock, { InlineCode } from './CodeBlock';
import ChatGPTAvatar from './icons/ChatGPTAvatar';

/**
 * Renders a single chat message (user or assistant).
 * User rows: bg #343541. Assistant rows: bg #444654.
 * Row content max-width 768px, centered.
 */
export default function Message({
  message,
  isStreaming,
  onCopy,
  onRegenerate,
  onEdit,
  userAvatarDataUrl,
}) {
  const [copied, setCopied] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(message.content);
  const editRef = useRef(null);

  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  const isStopped = message.status === 'stopped';
  const isError = message.status === 'error';

  // Focus edit textarea when entering edit mode
  useEffect(() => {
    if (editing && editRef.current) {
      editRef.current.focus();
      editRef.current.style.height = 'auto';
      editRef.current.style.height = editRef.current.scrollHeight + 'px';
    }
  }, [editing]);

  const handleCopyMessage = useCallback(() => {
    navigator.clipboard.writeText(message.content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
    if (onCopy) onCopy();
  }, [message.content, onCopy]);

  const handleStartEdit = useCallback(() => {
    setEditText(message.content);
    setEditing(true);
  }, [message.content]);

  const handleSaveEdit = useCallback(() => {
    if (editText.trim() && editText !== message.content) {
      onEdit && onEdit(message.id, editText.trim());
    }
    setEditing(false);
  }, [editText, message.content, message.id, onEdit]);

  const handleCancelEdit = useCallback(() => {
    setEditing(false);
    setEditText(message.content);
  }, [message.content]);

  const handleEditKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSaveEdit();
      }
      if (e.key === 'Escape') {
        handleCancelEdit();
      }
    },
    [handleSaveEdit, handleCancelEdit]
  );

  const rowBg = isUser ? 'var(--bg-user)' : 'var(--bg-assistant)';

  return (
    <div className="message-row" style={{ backgroundColor: rowBg }}>
      <div className="message-row-inner">
        <div className="message-avatar">
          {isUser ? (
            userAvatarDataUrl ? (
              <img
                className="user-avatar-img"
                src={userAvatarDataUrl}
                alt="User"
                width={30}
                height={30}
                draggable={false}
              />
            ) : (
              <User size={18} />
            )
          ) : (
            <ChatGPTAvatar size={30} />
          )}
        </div>

        <div className="message-body">
          {editing ? (
            <div className="message-edit-area">
              <textarea
                ref={editRef}
                className="message-edit-textarea"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleEditKeyDown}
                rows={3}
              />
              <div className="message-edit-actions">
                <button className="btn-edit-save" onClick={handleSaveEdit}>
                  Save & Submit
                </button>
                <button className="btn-edit-cancel" onClick={handleCancelEdit}>
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="message-content">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, className, children, ...props }) {
                    const isBlock = className || (String(children).includes('\n'));
                    if (isBlock) {
                      return <CodeBlock className={className}>{children}</CodeBlock>;
                    }
                    return <InlineCode>{children}</InlineCode>;
                  },
                }}
              >
                {message.content || (isStreaming ? '​' : '')}
              </ReactMarkdown>

              {/* Streaming cursor */}
              {isStreaming && <span className="streaming-cursor">▌</span>}

              {/* Status indicators */}
              {isStopped && (
                <span className="message-status stopped">Stopped</span>
              )}
              {isError && (
                <span className="message-status error">
                  Error: {message.error || 'Something went wrong'}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action buttons */}
        {!editing && message.content && message.status !== 'streaming' && (
          <div className="message-actions">
            <button
              className="msg-action-btn"
              onClick={handleCopyMessage}
              aria-label={copied ? 'Copied' : 'Copy message'}
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
            </button>
            {isUser && onEdit && (
              <button
                className="msg-action-btn"
                onClick={handleStartEdit}
                aria-label="Edit message"
              >
                <Edit3 size={15} />
              </button>
            )}
            {isAssistant && onRegenerate && (
              <button
                className="msg-action-btn"
                onClick={() => onRegenerate()}
                aria-label="Regenerate response"
              >
                <RefreshCw size={15} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
