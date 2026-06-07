import { useState, useCallback, useRef, useEffect } from 'react';
import { Plus, MessageSquare, Trash2, Edit3, Check, X, Settings, LogOut, Sun, Moon, Monitor, Zap } from 'lucide-react';
import { formatDate } from '../lib/utils';

/**
 * Left sidebar: new chat button, conversation list, bottom menu.
 * Collapsible on mobile via overlay/drawer.
 */
export default function Sidebar({
  conversations,
  currentId,
  onNewChat,
  onSelectChat,
  onRenameChat,
  onDeleteChat,
  onOpenSettings,
  theme,
  onToggleTheme,
  isOpen,
  onClose,
}) {
  const [renamingId, setRenamingId] = useState(null);
  const [renameText, setRenameText] = useState('');
  const renameRef = useRef(null);

  // Focus rename input
  useEffect(() => {
    if (renamingId && renameRef.current) {
      renameRef.current.focus();
      renameRef.current.select();
    }
  }, [renamingId]);

  const startRename = useCallback(
    (e, conv) => {
      e.stopPropagation();
      setRenamingId(conv.id);
      setRenameText(conv.title);
    },
    []
  );

  const confirmRename = useCallback(
    (id) => {
      if (renameText.trim()) {
        onRenameChat(id, renameText.trim());
      }
      setRenamingId(null);
    },
    [renameText, onRenameChat]
  );

  const cancelRename = useCallback(() => {
    setRenamingId(null);
  }, []);

  const handleRenameKeyDown = useCallback(
    (e, id) => {
      if (e.key === 'Enter') confirmRename(id);
      if (e.key === 'Escape') cancelRename();
    },
    [confirmRename, cancelRename]
  );

  const handleDelete = useCallback(
    (e, id) => {
      e.stopPropagation();
      onDeleteChat(id);
    },
    [onDeleteChat]
  );

  // Cycle theme: dark → light → system
  const cycleTheme = useCallback(() => {
    const themes = ['dark', 'light', 'system'];
    const idx = themes.indexOf(theme);
    onToggleTheme(themes[(idx + 1) % themes.length]);
  }, [theme, onToggleTheme]);

  const sidebarClasses = `sidebar ${isOpen ? 'sidebar-open' : ''}`;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={sidebarClasses}>
        {/* New chat button */}
        <div className="sidebar-new-chat">
          <button className="btn-new-chat" onClick={onNewChat} aria-label="New chat">
            <Plus size={16} />
            <span>New chat</span>
          </button>
        </div>

        {/* Conversation list */}
        <div className="sidebar-conversations">
          {conversations.length === 0 ? (
            <p className="sidebar-empty">
              History is temporarily unavailable.
              <br />
              We're working to restore this feature as soon as possible.
            </p>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`sidebar-item ${conv.id === currentId ? 'active' : ''}`}
                onClick={() => {
                  onSelectChat(conv.id);
                  onClose && onClose();
                }}
              >
                <MessageSquare size={15} className="sidebar-item-icon" />
                {renamingId === conv.id ? (
                  <div className="sidebar-rename-wrap">
                    <input
                      ref={renameRef}
                      className="sidebar-rename-input"
                      value={renameText}
                      onChange={(e) => setRenameText(e.target.value)}
                      onKeyDown={(e) => handleRenameKeyDown(e, conv.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      className="sidebar-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmRename(conv.id);
                      }}
                      aria-label="Confirm rename"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      className="sidebar-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        cancelRename();
                      }}
                      aria-label="Cancel rename"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="sidebar-item-title">{conv.title}</span>
                    <span className="sidebar-item-date">{formatDate(conv.updatedAt)}</span>
                    <div className="sidebar-item-actions">
                      <button
                        className="sidebar-action-btn"
                        onClick={(e) => startRename(e, conv)}
                        aria-label="Rename chat"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        className="sidebar-action-btn"
                        onClick={(e) => handleDelete(e, conv.id)}
                        aria-label="Delete chat"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* Bottom menu */}
        <div className="sidebar-bottom">
          <button className="sidebar-bottom-item" onClick={onNewChat} aria-label="Upgrade to Plus">
            <Zap size={15} />
            <span>Upgrade to Plus</span>
            <span className="badge-new">NEW</span>
          </button>

          <button className="sidebar-bottom-item" onClick={cycleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Moon size={15} /> : theme === 'light' ? <Sun size={15} /> : <Monitor size={15} />}
            <span>{theme === 'dark' ? 'Dark mode' : theme === 'light' ? 'Light mode' : 'System'}</span>
          </button>

          <button className="sidebar-bottom-item" onClick={onOpenSettings} aria-label="Open settings">
            <Settings size={15} />
            <span>Settings</span>
          </button>

          <button className="sidebar-bottom-item" onClick={() => {}} aria-label="Log out">
            <LogOut size={15} />
            <span>Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
