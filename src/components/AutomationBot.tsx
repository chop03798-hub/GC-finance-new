import { useEffect, useRef, useMemo, useState } from 'react'
import { Bot, ChevronDown, Lightbulb, MessageSquare, Sparkles, TrendingUp, Trash2, X, Zap } from 'lucide-react'
import type { PageId } from '../App'
import { runAutomationBot } from '../lib/automation'
import type { Deal, Rep, ClientFeedback } from '../lib/supabase'
import type { AppSettings } from '../lib/workspace'

interface AutomationBotProps {
  open: boolean
  onClose: () => void
  pageId: PageId
  pageLabel: string
  deals: Deal[]
  reps: Rep[]
  feedbacks: ClientFeedback[]
  settings: AppSettings
  fmtSAR: (value: number) => string
}

type BotTab = 'summary' | 'insights' | 'qa'

interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  meta?: string
  timestamp: Date
}

const SUGGESTED_PROMPTS: Record<string, string[]> = {
  overview: [
    'What are the biggest deals at risk right now?',
    'Which stage has the most value stuck in it?',
    'How is our forecast tracking vs target?',
  ],
  pipeline: [
    'Which deals should I focus on this week?',
    'Show me stale deals that need follow-up',
    'Which reps are closest to hitting their targets?',
  ],
  contracts: [
    'Which contracts are expiring soon?',
    'Show me overdue collections',
    'What is our total signed contract value?',
  ],
  revenue: [
    'How is MoM revenue trending?',
    'Which months are we at risk of missing target?',
    'Summarize our top revenue contributors',
  ],
  commissions: [
    'Who has the highest commission this period?',
    'Which reps are in tier 3 or above?',
    'What is the total commission liability?',
  ],
  default: [
    'Give me an executive summary of the current data',
    'What should I focus on today?',
    'What are the top three risks I should know about?',
  ],
}

function renderContent(content: string) {
  const lines = content.split('\n')
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} style={{ height: 6 }} />
        if (/^\d+\.\s/.test(line)) {
          return (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
              <span style={{ color: 'var(--accent)', fontWeight: 700, minWidth: 18, flexShrink: 0, fontFamily: 'var(--mono)', fontSize: 11 }}>{line.match(/^\d+/)?.[0]}.</span>
              <span style={{ color: 'var(--text1)', lineHeight: 1.55 }}>{line.replace(/^\d+\.\s/, '')}</span>
            </div>
          )
        }
        if (line.startsWith('- ') || line.startsWith('• ')) {
          return (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', paddingLeft: 4 }}>
              <span style={{ color: 'var(--accent)', minWidth: 12, flexShrink: 0, marginTop: 3 }}>▸</span>
              <span style={{ color: 'var(--text1)', lineHeight: 1.55 }}>{line.replace(/^[-•]\s/, '')}</span>
            </div>
          )
        }
        if (line.match(/^[A-Z].*:$/) || (line.endsWith(':') && line.length < 60)) {
          return <div key={i} style={{ color: 'var(--text3)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', marginTop: 8, marginBottom: 2 }}>{line}</div>
        }
        return <div key={i} style={{ color: 'var(--text1)', lineHeight: 1.6 }}>{line}</div>
      })}
    </div>
  )
}

export default function AutomationBot({
  open,
  onClose,
  pageId,
  pageLabel,
  deals,
  reps,
  feedbacks,
  settings,
  fmtSAR,
}: AutomationBotProps) {
  const [activeTab, setActiveTab] = useState<BotTab>('summary')
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const streamRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const prompts = SUGGESTED_PROMPTS[pageId] ?? SUGGESTED_PROMPTS.default

  const providerLabel = useMemo(() => {
    const labels: Record<string, string> = {
      cloudflare: '☁️ Cloudflare AI',
      local: 'Local engine',
      ollama: 'Ollama',
      openai: 'OpenAI',
      anthropic: 'Anthropic',
      'openai-compatible': 'OpenAI-compat',
    }
    return labels[settings.automationProvider] ?? settings.automationProvider
  }, [settings.automationProvider])

  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    if (open && activeTab === 'qa') {
      setTimeout(() => textareaRef.current?.focus(), 80)
    }
  }, [open, activeTab])

  if (!open) return null

  const run = async (mode: BotTab, overrideQuestion?: string) => {
    setLoading(true)
    const prompt = overrideQuestion ?? (mode === 'qa' ? question.trim() : mode === 'summary' ? `Summarize ${pageLabel}` : `Give insights for ${pageLabel}`)
    if (mode === 'qa' && !prompt) { setLoading(false); return }

    const userMsg: Message = { id: `${Date.now()}-user`, role: 'user', content: prompt, timestamp: new Date() }
    setMessages((current) => [...current, userMsg])
    if (mode === 'qa') setQuestion('')

    const result = await runAutomationBot({ pageId, pageLabel, mode, question: prompt, settings, deals, reps, feedbacks, fmtSAR })

    setMessages((current) => [
      ...current,
      {
        id: `${Date.now()}-assistant`,
        role: 'assistant',
        content: result.content,
        meta: result.warning ?? `${providerLabel}${result.fallbackUsed ? ' · local fallback used' : ''}`,
        timestamp: new Date(),
      },
    ])
    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (question.trim() && !loading) run('qa')
    }
  }

  const clearMessages = () => setMessages([])

  const tabs: Array<{ id: BotTab; icon: typeof Bot; label: string }> = [
    { id: 'summary', icon: Sparkles, label: 'Summary' },
    { id: 'insights', icon: Lightbulb, label: 'Insights' },
    { id: 'qa', icon: MessageSquare, label: 'Ask' },
  ]

  return (
    <div className="bot-overlay" onClick={onClose}>
      <aside className="bot-panel" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="bot-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="bot-header-icon">
              <Zap size={16} strokeWidth={2.5} />
            </div>
            <div>
              <h3>AI Assistant</h3>
              <p>{pageLabel} · {providerLabel} · {deals.length} deals loaded</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {messages.length > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={clearMessages} title="Clear conversation" type="button">
                <Trash2 size={13} />
              </button>
            )}
            <button className="btn btn-ghost btn-sm" onClick={onClose} type="button">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bot-tab-bar">
          {tabs.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              className={`bot-tab-btn${activeTab === id ? ' active' : ''}`}
              onClick={() => setActiveTab(id)}
              type="button"
            >
              <Icon size={13} strokeWidth={2} />
              {label}
            </button>
          ))}
        </div>

        {/* Quick action */}
        {activeTab !== 'qa' && (
          <div className="bot-quick-action">
            <button
              className="btn btn-primary bot-run-btn"
              disabled={loading}
              onClick={() => run(activeTab)}
              type="button"
            >
              {loading ? (
                <>
                  <span className="bot-spinner" />
                  Analyzing…
                </>
              ) : activeTab === 'summary' ? (
                <><Sparkles size={13} /> Summarize this page</>
              ) : (
                <><TrendingUp size={13} /> Generate insights</>
              )}
            </button>
          </div>
        )}

        {/* QA input */}
        {activeTab === 'qa' && (
          <div className="bot-qa-input">
            {messages.length === 0 && (
              <div className="bot-prompts">
                <div className="bot-prompts-label">Suggested questions</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                  {prompts.map((p) => (
                    <button
                      key={p}
                      className="bot-prompt-chip"
                      onClick={() => { setQuestion(p); run('qa', p) }}
                      type="button"
                    >
                      <ChevronDown size={11} style={{ flexShrink: 0, transform: 'rotate(-90deg)' }} />
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <textarea
                ref={textareaRef}
                className="field bot-input"
                rows={3}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about a client, rep, contract, or pipeline… (Enter to send)"
                disabled={loading}
              />
              <button
                className="btn btn-primary"
                disabled={loading || !question.trim()}
                onClick={() => run('qa')}
                type="button"
                style={{ alignSelf: 'flex-end', minWidth: 60 }}
              >
                {loading ? <span className="bot-spinner" /> : 'Send'}
              </button>
            </div>
            <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2 }}>Enter ↵ to send · Shift+Enter for new line</div>
          </div>
        )}

        {/* Message stream */}
        <div className="bot-stream" ref={streamRef}>
          {messages.length === 0 ? (
            <div className="bot-empty">
              <Bot size={28} style={{ color: 'var(--accent)', opacity: .6, marginBottom: 10 }} />
              <strong>AI Assistant ready</strong>
              <p>Use the tabs above to summarize the current page, surface operating insights, or ask specific questions about clients, deals, and performance.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`bot-message ${msg.role}`}>
                <div className="bot-message-header">
                  <span className="bot-message-role">
                    {msg.role === 'user' ? '🧑 You' : '🤖 Assistant'}
                  </span>
                  <span className="bot-message-time">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="bot-message-body">
                  {msg.role === 'assistant' ? renderContent(msg.content) : <div style={{ color: 'var(--text1)', lineHeight: 1.55 }}>{msg.content}</div>}
                </div>
                {msg.meta && <div className="bot-message-meta">{msg.meta}</div>}
              </div>
            ))
          )}
          {loading && (
            <div className="bot-message assistant">
              <div className="bot-message-header">
                <span className="bot-message-role">🤖 Assistant</span>
              </div>
              <div className="bot-typing">
                <span /><span /><span />
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
