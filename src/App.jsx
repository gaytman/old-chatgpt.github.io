import { useState, useCallback, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import SettingsModal from './components/SettingsModal';
import { generateId, truncateTitle, debounce } from './lib/utils';
import {
  loadConversations,
  saveConversations,
  loadSettings,
  saveSettings,
  clearAllData,
} from './lib/storage';
import { sendMessage, getErrorMessage } from './lib/openai';

/**
 * Root component.
 * Manages all state: conversations, current conversation, settings, sidebar.
 */
export default function App() {
  const [conversations, setConversations] = useState(() => loadConversations());
  const [currentId, setCurrentId] = useState(() => {
    const convs = loadConversations();
    return convs.length > 0 ? convs[0].id : null;
  });
  const [settings, setSettings] = useState(() => loadSettings());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const abortRef = useRef(null);

  // Apply theme
  useEffect(() => {
    const theme = settings.theme;
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [settings.theme]);

  // Persist conversations with debounce
  const debouncedSave = useRef(
    debounce((convs) => saveConversations(convs), 300)
  ).current;

  useEffect(() => {
    debouncedSave(conversations);
  }, [conversations, debouncedSave]);

  // Persist settings
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // ─── Conversation helpers ─────────────────────────────────────

  const currentConv = conversations.find((c) => c.id === currentId) || null;

  const updateConversation = useCallback((id, updater) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...updater(c), updatedAt: Date.now() } : c))
    );
  }, []);

  // ─── Handlers ─────────────────────────────────────────────────

  const handleNewChat = useCallback(() => {
    const newConv = {
      id: generateId(),
      title: 'New chat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    setConversations((prev) => [newConv, ...prev]);
    setCurrentId(newConv.id);
    setSidebarOpen(false);
  }, []);

  const handleSelectChat = useCallback((id) => {
    setCurrentId(id);
  }, []);

  const handleRenameChat = useCallback((id, title) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title, updatedAt: Date.now() } : c))
    );
  }, []);

  const handleDeleteChat = useCallback((id) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (currentId === id) {
      setConversations((prev) => {
        if (prev.length > 0) {
          setCurrentId(prev[0].id);
        } else {
          setCurrentId(null);
        }
        return prev;
      });
    }
  }, [currentId]);

  const handleSendMessage = useCallback(
    async (text) => {
      let convId = currentId;

      // Create new conversation if none active
      if (!convId) {
        const newConv = {
          id: generateId(),
          title: truncateTitle(text),
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: [],
        };
        setConversations((prev) => [newConv, ...prev]);
        convId = newConv.id;
        setCurrentId(convId);
      }

      // Update title from first user message
      const conv = conversations.find((c) => c.id === convId);
      if (conv && conv.messages.length === 0) {
        const title = truncateTitle(text);
        updateConversation(convId, (c) => ({ ...c, title }));
      }

      // Add user message
      const userMsg = {
        id: generateId(),
        role: 'user',
        content: text,
        createdAt: Date.now(),
        status: 'done',
      };

      // Add empty assistant message placeholder
      const assistantMsg = {
        id: generateId(),
        role: 'assistant',
        content: '',
        createdAt: Date.now(),
        status: 'streaming',
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== convId) return c;
          return {
            ...c,
            messages: [...c.messages, userMsg, assistantMsg],
            updatedAt: Date.now(),
          };
        })
      );

      // Prepare for API call
      const allMessages = (() => {
        const conv = conversations.find((c) => c.id === convId);
        return conv ? [...conv.messages, userMsg] : [userMsg];
      })();

      const controller = new AbortController();
      abortRef.current = controller;
      setIsGenerating(true);

      let fullContent = '';

      const result = await sendMessage({
        messages: allMessages,
        systemPrompt: settings.systemPrompt,
        model: settings.model,
        temperature: settings.temperature,
        maxTokens: settings.maxTokens,
        apiKey: settings.apiKey,
        signal: controller.signal,
        onChunk: (delta) => {
          fullContent += delta;
          updateConversation(convId, (c) => ({
            ...c,
            messages: c.messages.map((m) =>
              m.id === assistantMsg.id
                ? { ...m, content: fullContent }
                : m
            ),
          }));
        },
      });

      // Determine final status from the result
      let finalStatus = 'done';
      let errorMessage;

      if (result.error === 'aborted') {
        finalStatus = fullContent ? 'stopped' : 'done';
      } else if (result.error) {
        finalStatus = 'error';
        errorMessage = getErrorMessage(result.error);
      }

      setIsGenerating(false);
      abortRef.current = null;

      // Final update to the assistant message
      updateConversation(convId, (c) => ({
        ...c,
        messages: c.messages.map((m) =>
          m.id === assistantMsg.id
            ? {
                ...m,
                content: fullContent,
                status: finalStatus,
                error: errorMessage,
              }
            : m
        ),
      }));
    },
    [currentId, conversations, settings, updateConversation]
  );

  const handleSend = useCallback(
    (text) => {
      handleSendMessage(text);
    },
    [handleSendMessage]
  );

  const handleStopGeneration = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
  }, []);

  const handleRegenerate = useCallback(() => {
    if (!currentConv || isGenerating) return;

    const msgs = currentConv.messages;
    if (msgs.length < 2) return;

    // Find last user message and remove everything after it
    let lastUserIdx = -1;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === 'user') {
        lastUserIdx = i;
        break;
      }
    }
    if (lastUserIdx === -1) return;

    const userMsg = msgs[lastUserIdx];

    // Remove messages after the last user message
    updateConversation(currentConv.id, (c) => ({
      ...c,
      messages: c.messages.slice(0, lastUserIdx),
    }));

    // Re-send from that user message
    handleSendMessage(userMsg.content);
  }, [currentConv, isGenerating, updateConversation, handleSendMessage]);

  const handleEditMessage = useCallback(
    (msgId, newText) => {
      if (!currentConv || isGenerating) return;

      const msgs = currentConv.messages;
      const msgIdx = msgs.findIndex((m) => m.id === msgId);
      if (msgIdx === -1 || msgs[msgIdx].role !== 'user') return;

      // Update the edited message and truncate everything after it
      updateConversation(currentConv.id, (c) => ({
        ...c,
        messages: c.messages.slice(0, msgIdx).map((m) =>
          m.id === msgId ? { ...m, content: newText } : m
        ),
      }));

      // Re-send from the edited user message
      handleSendMessage(newText);
    },
    [currentConv, isGenerating, updateConversation, handleSendMessage]
  );

  const handleCopyMessage = useCallback(() => {
    // The copy happens inside the Message component
    // No additional state needed
  }, []);

  const handleUpdateSettings = useCallback((partial) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const handleClearAllData = useCallback(() => {
    clearAllData();
    setConversations([]);
    setCurrentId(null);
    setSettings(loadSettings());
  }, []);

  const handleToggleTheme = useCallback((newTheme) => {
    setSettings((prev) => ({ ...prev, theme: newTheme }));
  }, []);

  return (
    <div className="app">
      <Sidebar
        conversations={conversations}
        currentId={currentId}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onRenameChat={handleRenameChat}
        onDeleteChat={handleDeleteChat}
        onOpenSettings={() => setSettingsOpen(true)}
        theme={settings.theme}
        onToggleTheme={handleToggleTheme}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <ChatWindow
        conversation={currentConv}
        isGenerating={isGenerating}
        onSend={handleSend}
        onStop={handleStopGeneration}
        onCopyMessage={handleCopyMessage}
        onRegenerate={handleRegenerate}
        onEditMessage={handleEditMessage}
        hasApiKey={!!settings.apiKey?.trim()}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
      />

      {settingsOpen && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClearAllData={handleClearAllData}
          onClose={() => setSettingsOpen(false)}
        />
      )}
    </div>
  );
}
