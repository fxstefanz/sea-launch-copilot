import { useEffect, useRef, useState } from "react"
import { MessageCircle, X, Send, Loader2, Bot, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMarketEntryStore } from "@/features/marketEntry/store"

interface Message {
  role: "user" | "assistant"
  text: string
}

interface ChatContext {
  title: string
  brand?: string
}

// Global trigger — other components call this to open the bot with pre-filled context
type OpenChatFn = (context: ChatContext, prefill?: string) => void
let _openChat: OpenChatFn | null = null
export function openChatWithContext(context: ChatContext, prefill?: string) {
  _openChat?.(context, prefill)
}

async function sendMessage(message: string, contextTitle?: string, brandName?: string): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, context_title: contextTitle, brand_name: brandName }),
  })
  if (!res.ok) throw new Error("Chat service unavailable")
  const data = await res.json()
  return data.reply as string
}

const SUGGESTED_QUESTIONS = [
  "How do I apply for an SFA import permit?",
  "What should my first step be?",
  "What documents do I need for GST registration?",
  "How do I open a TikTok Shop store?",
]

export function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [context, setContext] = useState<ChatContext | null>(null)
  const [minimized, setMinimized] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const analysis = useMarketEntryStore((s) => s.analysis)

  // Register global open trigger
  useEffect(() => {
    _openChat = (ctx, prefill) => {
      setContext(ctx)
      setOpen(true)
      setMinimized(false)
      if (prefill) setInput(prefill)
    }
    return () => { _openChat = null }
  }, [])

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  // Focus input when opened
  useEffect(() => {
    if (open && !minimized) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open, minimized])

  async function handleSend(text?: string) {
    const msg = (text ?? input).trim()
    if (!msg || loading) return
    setInput("")
    setMessages((prev) => [...prev, { role: "user", text: msg }])
    setLoading(true)
    try {
      const reply = await sendMessage(msg, context?.title, context?.brand)
      setMessages((prev) => [...prev, { role: "assistant", text: reply }])
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", text: "Sorry, the assistant is temporarily unavailable. Please make sure the backend is running." }])
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); setMinimized(false) }}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[color:var(--accent)] text-white shadow-xl transition hover:scale-105 hover:shadow-2xl"
        aria-label="Open assistant"
      >
        <MessageCircle className="h-6 w-6" />
        {analysis && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[color:var(--success)] text-[9px] font-bold text-white">
            AI
          </span>
        )}
      </button>
    )
  }

  return (
    <div className={cn(
      "fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] shadow-2xl transition-all duration-300",
      minimized ? "h-14 w-72" : "h-[520px] w-[360px]"
    )}>
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[color:var(--border)] bg-[color:var(--accent)] px-4 py-3">
        <div className="flex items-center gap-2">
          <Bot className="h-4 w-4 text-white" />
          <span className="text-sm font-semibold text-white">Launch Copilot</span>
          {context && (
            <span className="max-w-[120px] truncate rounded-full bg-white/20 px-2 py-0.5 text-[10px] text-white">
              {context.title}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setMinimized((v) => !v)} className="rounded p-1 text-white/80 hover:text-white">
            <ChevronDown className={cn("h-4 w-4 transition-transform", minimized && "rotate-180")} />
          </button>
          <button onClick={() => setOpen(false)} className="rounded p-1 text-white/80 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!minimized && (
        <>
          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)] text-white">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-[color:var(--surface)] px-3 py-2 text-sm text-[color:var(--fg)]">
                    {analysis
                      ? "Hi! I've reviewed your analysis report. What would you like to dig into? For example: the SFA application process, GST registration, or how to set up a TikTok Shop."
                      : "Hi! I'm SEA Launch Copilot. I can answer your questions about entering the Singapore market. Run an analysis first, or just ask away!"}
                  </div>
                </div>

                {/* Suggested questions */}
                <div className="ml-9 space-y-1.5">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => handleSend(q)}
                      className="block w-full rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 text-left text-xs text-[color:var(--fg)] transition hover:border-[color:var(--accent)] hover:bg-[color:color-mix(in_oklab,var(--accent)_8%,var(--surface))]"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div key={i} className={cn("flex items-start gap-2", m.role === "user" && "flex-row-reverse")}>
                <div className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                  m.role === "assistant"
                    ? "bg-[color:var(--accent)] text-white"
                    : "bg-[color:var(--surface-2)] text-[color:var(--muted)]"
                )}>
                  {m.role === "assistant" ? <Bot className="h-3.5 w-3.5" /> : "You"}
                </div>
                <div className={cn(
                  "max-w-[260px] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm",
                  m.role === "assistant"
                    ? "rounded-tl-sm bg-[color:var(--surface)] text-[color:var(--fg)]"
                    : "rounded-tr-sm bg-[color:var(--accent)] text-white"
                )}>
                  {m.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-start gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[color:var(--accent)] text-white">
                  <Bot className="h-3.5 w-3.5" />
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-[color:var(--surface)] px-3 py-2.5">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[color:var(--muted)]" />
                  <span className="text-xs text-[color:var(--muted)]">Thinking…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="shrink-0 border-t border-[color:var(--border)] p-3">
            <div className="flex items-center gap-2 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] px-3 py-2 focus-within:border-[color:var(--accent)]">
              <input
                ref={inputRef}
                className="flex-1 bg-transparent text-sm text-[color:var(--fg)] outline-none placeholder:text-[color:var(--muted)]"
                placeholder="Ask me anything about market entry…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                disabled={loading}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[color:var(--accent)] text-white transition disabled:opacity-40"
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mt-1.5 text-center text-[10px] text-[color:var(--muted)]">
              Powered by AI + RAG · Not legal/tax advice
            </div>
          </div>
        </>
      )}
    </div>
  )
}
