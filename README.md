# Nostalgic ChatGPT Clone

A local-only, browser-based ChatGPT clone that recreates the early 2023 ChatGPT dark-mode look and feel.

This is **not** real GPT-3.5 — it only emulates the old GPT-3.5 ChatGPT feeling through UI design and system prompting. It uses the modern OpenAI Responses API under the hood.

## Setup

```bash
npm install
npm run dev
```

## How to Use

1. Open the app in your browser (default: `http://localhost:3000`).
2. Click **Settings** in the bottom-left sidebar menu.
3. Paste your **OpenAI API key**.
4. Choose a model (default: `gpt-4o`).
5. Optionally click **GPT-3.5 Nostalgia Mode** to load the nostalgic system prompt.
6. Close settings and start chatting.

## Features

- Streaming responses with stop button
- Markdown rendering with code block copy buttons
- Conversation history (localStorage)
- Rename and delete conversations
- Regenerate last response
- Edit previous user messages and regenerate
- GPT-3.5 Nostalgia Mode preset
- Dark / Light / System theme
- Mobile responsive

## Security Warning

⚠️ **This is a local-only app.** Your OpenAI API key is stored in your browser's localStorage and is exposed in client-side code. **Do not deploy this app publicly.** Anyone with access to the browser's developer tools can extract your API key.

## Disclaimer

- This app is not affiliated with, endorsed by, or connected to OpenAI.
- It is not real GPT-3.5 — it only emulates the old ChatGPT UI and uses a system prompt to mimic the tone.
- No backend, no database, no authentication, no telemetry.
- All data stays in your browser.

## Tech Stack

- Vite
- React (JavaScript)
- OpenAI Responses API (streaming)
- localStorage for persistence
- react-markdown + remark-gfm
- lucide-react (icons)
