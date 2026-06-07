import { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';

/**
 * Renders a code block with language label, copy button, and dark background.
 * Used as the custom `code` component for react-markdown.
 */
export default function CodeBlock({ children, className }) {
  const [copied, setCopied] = useState(false);

  // Extract language from className (react-markdown uses "language-xxx" format)
  const language = className ? className.replace('language-', '') : '';
  const code = String(children).replace(/\n$/, '');

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  return (
    <div className="code-block">
      <div className="code-block-header">
        <span className="code-block-lang">{language || 'code'}</span>
        <button
          className="code-block-copy"
          onClick={handleCopy}
          aria-label={copied ? 'Copied' : 'Copy code'}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
      <pre className="code-block-pre">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}

// Inline code component (for `code` not inside a `pre`)
export function InlineCode({ children }) {
  return <code className="inline-code">{children}</code>;
}
