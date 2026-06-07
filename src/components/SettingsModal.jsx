import { useState, useCallback, useEffect, useRef } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { GPT35_NOSTALGIA_PROMPT, DEFAULT_MODEL, DEFAULT_TEMPERATURE, DEFAULT_MAX_TOKENS } from '../lib/prompts';

/**
 * Settings modal.
 * API key, model, temperature, max tokens, system prompt, theme, clear data.
 */
export default function SettingsModal({ settings, onUpdateSettings, onClearAllData, onClose }) {
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [model, setModel] = useState(settings.model);
  const [temperature, setTemperature] = useState(settings.temperature);
  const [maxTokens, setMaxTokens] = useState(settings.maxTokens);
  const [systemPrompt, setSystemPrompt] = useState(settings.systemPrompt);
  const [theme, setTheme] = useState(settings.theme);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const apiKeyRef = useRef(null);
  const modalRef = useRef(null);

  // Auto-focus API key input if empty
  useEffect(() => {
    if (!settings.apiKey && apiKeyRef.current) {
      apiKeyRef.current.focus();
    }
  }, [settings.apiKey]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Click outside to close
  const handleBackdropClick = useCallback(
    (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    },
    [onClose]
  );

  const handleSave = useCallback(() => {
    onUpdateSettings({
      apiKey: apiKey.trim(),
      model: model.trim() || DEFAULT_MODEL,
      temperature: Number(temperature),
      maxTokens: Number(maxTokens),
      systemPrompt,
      theme,
    });
    onClose();
  }, [apiKey, model, temperature, maxTokens, systemPrompt, theme, onUpdateSettings, onClose]);

  const handleNostalgiaMode = useCallback(() => {
    setSystemPrompt(GPT35_NOSTALGIA_PROMPT);
    setTemperature(0.7);
    setMaxTokens(2048);
  }, []);

  const handleClearAll = useCallback(() => {
    if (showClearConfirm) {
      onClearAllData();
      setShowClearConfirm(false);
      onClose();
    } else {
      setShowClearConfirm(true);
    }
  }, [showClearConfirm, onClearAllData, onClose]);

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal" ref={modalRef} role="dialog" aria-label="Settings">
        <div className="modal-header">
          <h2 className="modal-title">Settings</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close settings">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {/* Security warning */}
          <div className="security-warning">
            <AlertTriangle size={16} />
            <p>
              This is a local-only app. Your API key is stored in this browser and can
              be exposed in client-side code. Do not deploy this app publicly.
            </p>
          </div>

          {/* API Key */}
          <div className="form-group">
            <label className="form-label" htmlFor="api-key">
              OpenAI API Key
            </label>
            <div className="api-key-input-wrap">
              <input
                ref={apiKeyRef}
                id="api-key"
                className="form-input"
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                autoComplete="off"
              />
              <button
                className="toggle-key-btn"
                onClick={() => setShowKey((v) => !v)}
                aria-label={showKey ? 'Hide API key' : 'Show API key'}
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {/* Model */}
          <div className="form-group">
            <label className="form-label" htmlFor="model">
              Model
            </label>
            <input
              id="model"
              className="form-input"
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder={DEFAULT_MODEL}
            />
          </div>

          {/* Temperature */}
          <div className="form-group">
            <label className="form-label" htmlFor="temperature">
              Temperature: {temperature}
            </label>
            <input
              id="temperature"
              className="form-range"
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
            />
            <div className="range-labels">
              <span>0</span>
              <span>1</span>
              <span>2</span>
            </div>
          </div>

          {/* Max output tokens */}
          <div className="form-group">
            <label className="form-label" htmlFor="max-tokens">
              Max Output Tokens
            </label>
            <input
              id="max-tokens"
              className="form-input"
              type="number"
              min="1"
              max="128000"
              value={maxTokens}
              onChange={(e) => setMaxTokens(e.target.value)}
            />
          </div>

          {/* System prompt */}
          <div className="form-group">
            <div className="form-label-row">
              <label className="form-label" htmlFor="system-prompt">
                System Prompt
              </label>
              <button className="btn-preset" onClick={handleNostalgiaMode}>
                GPT-3.5 Nostalgia Mode
              </button>
            </div>
            <textarea
              id="system-prompt"
              className="form-textarea"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              rows={6}
              placeholder="You are a helpful assistant."
            />
          </div>

          {/* Theme */}
          <div className="form-group">
            <label className="form-label" htmlFor="theme">
              Theme
            </label>
            <select
              id="theme"
              className="form-select"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="system">System</option>
            </select>
          </div>

          {/* Clear all data */}
          <div className="form-group">
            <button className="btn-clear-data" onClick={handleClearAll}>
              {showClearConfirm ? 'Click again to confirm — this cannot be undone' : 'Clear all local data'}
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-save" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
