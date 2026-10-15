import React, { useState } from 'react'

interface MarkdownRendererProps {
  content: string
  theme?: 'dark' | 'light'
}

/**
 * Parses inline markdown:
 * - Bold: **text** or __text__
 * - Italic: *text* or _text_
 * - Strikethrough: ~~text~~
 * - Inline code: `code`
 * - Links: [label](url)
 */
function renderInline(text: string, isDark: boolean): React.ReactNode[] {
  // Regex to split by inline markdown tokens
  // Group 1: code, Group 2: bold, Group 3: italic, Group 4: strike, Group 5: link text, Group 6: link url
  const tokenRegex =
    /(`([^`]+)`)|\*\*([^*]+)\*\*|__([^_]+)__|(?:\*([^*]+)\*|_([^_]+)_)|~~([^~]+)~~|\[([^\]]+)\]\(([^)]+)\)/g

  const elements: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = tokenRegex.exec(text)) !== null) {
    // Plain text before match
    if (match.index > lastIndex) {
      elements.push(text.substring(lastIndex, match.index))
    }

    const fullMatch = match[0]
    const key = `inline-${match.index}-${fullMatch}`

    if (match[1]) {
      // Inline code
      elements.push(
        <code
          key={key}
          className={`px-1.5 py-0.5 rounded font-mono text-[12px] ${
            isDark
              ? 'bg-zinc-800 border border-zinc-700/60 text-emerald-400'
              : 'bg-zinc-200/80 border border-zinc-300 text-emerald-700'
          }`}
        >
          {match[2]}
        </code>
      )
    } else if (match[3] || match[4]) {
      // Bold
      elements.push(
        <strong key={key} className="font-bold text-white">
          {match[3] || match[4]}
        </strong>
      )
    } else if (match[5] || match[6]) {
      // Italic
      elements.push(
        <em key={key} className="italic opacity-90">
          {match[5] || match[6]}
        </em>
      )
    } else if (match[7]) {
      // Strikethrough
      elements.push(
        <del key={key} className="line-through opacity-70">
          {match[7]}
        </del>
      )
    } else if (match[8] && match[9]) {
      // Link
      elements.push(
        <a
          key={key}
          href={match[9]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2 transition-colors inline-flex items-center gap-0.5"
        >
          {match[8]}
          <span className="text-[10px] opacity-70">↗</span>
        </a>
      )
    }

    lastIndex = tokenRegex.lastIndex
  }

  if (lastIndex < text.length) {
    elements.push(text.substring(lastIndex))
  }

  return elements
}

interface CodeBlockProps {
  language: string
  code: string
  isDark: boolean
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, code, isDark }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={`my-2 rounded-xl border overflow-hidden text-xs font-mono ${
        isDark ? 'bg-zinc-950 border-zinc-800' : 'bg-zinc-100 border-zinc-300'
      }`}
    >
      <div
        className={`px-3 py-1.5 flex items-center justify-between border-b text-[11px] ${
          isDark
            ? 'bg-zinc-900 border-zinc-800 text-zinc-400'
            : 'bg-zinc-200/80 border-zinc-300 text-zinc-600'
        }`}
      >
        <span className="uppercase font-semibold tracking-wider">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
            copied
              ? 'text-emerald-400 font-bold'
              : 'hover:text-white hover:bg-zinc-800'
          }`}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <pre className="p-3 overflow-x-auto leading-relaxed text-zinc-200">
        <code>{code}</code>
      </pre>
    </div>
  )
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, theme = 'dark' }) => {
  const isDark = theme === 'dark'

  // Pre-process content into blocks (code blocks vs text blocks)
  const lines = content.split('\n')
  const blocks: React.ReactNode[] = []

  let inCodeBlock = false
  let codeLang = ''
  let codeBuffer: string[] = []

  let inList = false
  let listItems: React.ReactNode[] = []

  const flushList = () => {
    if (inList && listItems.length > 0) {
      blocks.push(
        <ul key={`ul-${blocks.length}`} className="my-1.5 space-y-1 pl-4 list-disc marker:text-emerald-500">
          {listItems}
        </ul>
      )
      listItems = []
      inList = false
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Code block delimiters: ```lang or ```
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End of code block
        blocks.push(
          <CodeBlock
            key={`code-${blocks.length}`}
            language={codeLang}
            code={codeBuffer.join('\n')}
            isDark={isDark}
          />
        )
        codeBuffer = []
        codeLang = ''
        inCodeBlock = false
      } else {
        flushList()
        inCodeBlock = true
        codeLang = line.trim().slice(3).trim()
      }
      continue
    }

    if (inCodeBlock) {
      codeBuffer.push(line)
      continue
    }

    // Headers
    if (line.startsWith('# ')) {
      flushList()
      blocks.push(
        <h1 key={`h1-${i}`} className="mt-2 mb-1 text-base font-bold text-white border-b border-zinc-800 pb-1">
          {renderInline(line.slice(2), isDark)}
        </h1>
      )
      continue
    }
    if (line.startsWith('## ')) {
      flushList()
      blocks.push(
        <h2 key={`h2-${i}`} className="mt-2 mb-1 text-sm font-bold text-white">
          {renderInline(line.slice(3), isDark)}
        </h2>
      )
      continue
    }
    if (line.startsWith('### ')) {
      flushList()
      blocks.push(
        <h3 key={`h3-${i}`} className="mt-1.5 mb-1 text-xs font-bold text-emerald-400">
          {renderInline(line.slice(4), isDark)}
        </h3>
      )
      continue
    }

    // Blockquote
    if (line.startsWith('> ')) {
      flushList()
      blocks.push(
        <blockquote
          key={`quote-${i}`}
          className={`my-1.5 pl-3 border-l-2 border-emerald-500 text-xs italic ${
            isDark ? 'text-zinc-400' : 'text-zinc-600'
          }`}
        >
          {renderInline(line.slice(2), isDark)}
        </blockquote>
      )
      continue
    }

    // Horizontal Rule
    if (/^(\*\*\*|---|___)$/.test(line.trim())) {
      flushList()
      blocks.push(
        <hr key={`hr-${i}`} className={`my-2 border-t ${isDark ? 'border-zinc-800' : 'border-zinc-300'}`} />
      )
      continue
    }

    // Bullet List Items: - , * , +
    const bulletMatch = line.match(/^(\s*)[-*+]\s+(.+)/)
    if (bulletMatch) {
      inList = true
      listItems.push(
        <li key={`li-${i}`} className="leading-snug">
          {renderInline(bulletMatch[2], isDark)}
        </li>
      )
      continue
    }

    // Numbered List Items: 1. 2.
    const numMatch = line.match(/^(\s*)\d+\.\s+(.+)/)
    if (numMatch) {
      flushList()
      blocks.push(
        <div key={`num-${i}`} className="flex gap-2 my-0.5 leading-snug">
          <span className="text-emerald-500 font-mono text-xs font-bold shrink-0">•</span>
          <span>{renderInline(numMatch[2], isDark)}</span>
        </div>
      )
      continue
    }

    // Standard Paragraph
    if (line.trim().length > 0) {
      flushList()
      blocks.push(
        <p key={`p-${i}`} className="my-1 leading-relaxed">
          {renderInline(line, isDark)}
        </p>
      )
    } else {
      flushList()
    }
  }

  // Flush remaining
  if (inCodeBlock) {
    blocks.push(
      <CodeBlock
        key={`code-end`}
        language={codeLang}
        code={codeBuffer.join('\n')}
        isDark={isDark}
      />
    )
  }
  flushList()

  return <div className="space-y-1 text-sm font-sans">{blocks}</div>
}
