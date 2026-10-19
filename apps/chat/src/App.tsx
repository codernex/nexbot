import { useState } from "react";
import { ChatWidget } from "./components/ChatWidget";

export function App() {
  const [apiUrl, setApiUrl] = useState("http://localhost:9090");
  const [token, setToken] = useState("8fd1d532-7992-4c0b-90c8-d4cf6a53b783");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [position, setPosition] = useState<"bottom-right" | "bottom-left">(
    "bottom-right",
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6 selection:bg-emerald-500/30 selection:text-emerald-400 font-sans">
      <div className="max-w-3xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-mono text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            Vite + React 19 + Tailwind CSS + Web Component
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            NexBot <span className="text-emerald-400">Web Component</span>
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto">
            Interactive, standalone chat interface powered by pgvector RAG
            embeddings. Embeddable into any website with a single script tag.
          </p>
        </div>

        {/* Playground Controls */}
        <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl shadow-xl space-y-5">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            ⚙️ Configuration Playground
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-zinc-400 uppercase mb-1.5">
                Backend API URL
              </label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm focus:outline-none focus:border-emerald-500"
                placeholder="http://localhost:9090"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 uppercase mb-1.5">
                Auth Token (Optional)
              </label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm focus:outline-none focus:border-emerald-500"
                placeholder="JWT Token for /chat"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 uppercase mb-1.5">
                Theme
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as "dark" | "light")}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="dark">Dark Theme</option>
                <option value="light">Light Theme</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-zinc-400 uppercase mb-1.5">
                Position
              </label>
              <select
                value={position}
                onChange={(e) =>
                  setPosition(e.target.value as "bottom-right" | "bottom-left")
                }
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-200 text-sm focus:outline-none focus:border-emerald-500"
              >
                <option value="bottom-right">Bottom Right</option>
                <option value="bottom-left">Bottom Left</option>
              </select>
            </div>
          </div>
        </div>

        {/* How to Embed */}
        <div className="p-6 rounded-2xl border border-zinc-800/80 bg-zinc-900/30 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            🚀 How to Embed on Any Website
          </h2>
          <p className="text-xs text-zinc-400">
            Build the web component using{" "}
            <code className="text-emerald-400 bg-zinc-900 px-1.5 py-0.5 rounded">
              pnpm run build:wc
            </code>
            , then add this to any HTML page:
          </p>

          <pre className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs text-emerald-400 overflow-x-auto leading-relaxed">
          
          </pre>
        </div>
      </div>

      {/* Floating Widget Live Instance */}
      <ChatWidget
        apiUrl={apiUrl}
        token={token}
        theme={theme}
        position={position}
        botName="NexBot AI"
      />
    </div>
  );
}

export default App;
