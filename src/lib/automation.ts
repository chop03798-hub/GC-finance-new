import type { Deal, Rep, ClientFeedback } from './supabase'
import type { AppSettings } from './workspace'

export type AutomationMode = 'summary' | 'insights' | 'qa'

export interface BotMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AutomationRunInput {
  pageId: string
  pageLabel: string
  mode: AutomationMode
  question?: string
  settings: AppSettings
  deals: Deal[]
  reps: Rep[]
  feedbacks: ClientFeedback[]
  fmtSAR: (value: number) => string
}

export interface AutomationRunResult {
  content: string
  providerUsed: string
  fallbackUsed: boolean
  warning?: string
}

interface AutomationContext {
  pageId: string
  pageLabel: string
  activeDeals: Deal[]
  allDeals: Deal[]
  reps: Rep[]
  feedbacks: ClientFeedback[]
  fmtSAR: (value: number) => string
}

function buildContext(input: AutomationRunInput): AutomationContext {
  const activeDeals = input.deals.filter((deal) => !['Closed – With Contract', 'Closed – No Contract', 'Lost'].includes(deal.stage))
  return {
    pageId: input.pageId,
    pageLabel: input.pageLabel,
    activeDeals,
    allDeals: input.deals,
    reps: input.reps,
    feedbacks: input.feedbacks,
    fmtSAR: input.fmtSAR,
  }
}

function topDeals(context: AutomationContext, count: number) {
  return [...context.activeDeals]
    .sort((a, b) => b.quotation_value - a.quotation_value)
    .slice(0, count)
}

function staleDeals(context: AutomationContext, minDays: number) {
  return context.activeDeals.filter((deal) => deal.days_in_stage >= minDays)
}

function overdueDeals(context: AutomationContext) {
  return context.allDeals.filter((deal) => deal.collection_status === 'Overdue')
}

function matchingDeal(context: AutomationContext, question: string) {
  const normalized = question.toLowerCase()
  return context.allDeals.find((deal) => normalized.includes(deal.company_name.toLowerCase()))
}

function pageSummary(context: AutomationContext) {
  const totalPipeline = context.activeDeals.reduce((sum, deal) => sum + deal.quotation_value, 0)
  const closedRevenue = context.allDeals
    .filter((deal) => ['Closed – With Contract', 'Closed – No Contract'].includes(deal.stage))
    .reduce((sum, deal) => sum + deal.quotation_value, 0)
  const weighted = context.activeDeals.reduce((sum, deal) => sum + (deal.quotation_value * deal.probability) / 100, 0)
  const overdue = overdueDeals(context)
  const stale = staleDeals(context, 10)
  const hot = topDeals(context, 3)

  return [
    `${context.pageLabel} summary`,
    ``,
    `Open pipeline: ${context.fmtSAR(totalPipeline)} across ${context.activeDeals.length} active deals.`,
    `Closed revenue: ${context.fmtSAR(closedRevenue)}.`,
    `Weighted forecast: ${context.fmtSAR(weighted)}.`,
    `Overdue collections: ${overdue.length}. Stale deals above 10 days: ${stale.length}.`,
    ``,
    `Top opportunities:`,
    ...hot.map((deal) => `- ${deal.company_name}: ${deal.stage}, ${context.fmtSAR(deal.quotation_value)}, owner ${deal.sales_exec_name}`),
  ].join('\n')
}

function pageInsights(context: AutomationContext) {
  const stale = staleDeals(context, 10)
  const critical = context.activeDeals.filter((deal) => deal.days_in_stage > 14 && deal.probability < 50)
  const overdue = overdueDeals(context)
  const pendingClosure = context.allDeals.filter((deal) => deal.stage === 'Pending for closure')
  const topRep = [...context.reps].sort((a, b) => b.secured - a.secured)[0]
  const lostReasons = context.allDeals
    .filter((deal) => deal.stage === 'Lost' && deal.lost_reason)
    .reduce<Record<string, number>>((acc, deal) => {
      const key = deal.lost_reason ?? 'Unknown'
      acc[key] = (acc[key] ?? 0) + 1
      return acc
    }, {})
  const topLostReason = Object.entries(lostReasons).sort((a, b) => b[1] - a[1])[0]

  return [
    `${context.pageLabel} insights`,
    ``,
    `1. Pipeline pressure: ${stale.length} active deals are sitting more than 10 days in stage. ${critical.length} of them are both old and below 50% probability.`,
    `2. Collection risk: ${overdue.length} deals are overdue. Their tracked collected amount at risk is ${context.fmtSAR(overdue.reduce((sum, deal) => sum + (deal.collected_amount ?? 0), 0))}.`,
    `3. Near-term close pool: ${pendingClosure.length} deals are in Pending for closure, worth ${context.fmtSAR(pendingClosure.reduce((sum, deal) => sum + deal.quotation_value, 0))}.`,
    `4. Team signal: ${topRep ? `${topRep.name} leads secured revenue with ${context.fmtSAR(topRep.secured)} against a ${context.fmtSAR(topRep.monthly_target)} target.` : 'No rep data is available.'}`,
    `5. Loss trend: ${topLostReason ? `${topLostReason[0]} is the top recorded loss reason (${topLostReason[1]} deals).` : 'No structured loss reasons are stored yet.'}`,
  ].join('\n')
}

function answerQuestion(context: AutomationContext, question: string) {
  const deal = matchingDeal(context, question)
  if (deal) {
    const feedback = context.feedbacks.find((item) => item.client_id.toLowerCase() === deal.company_name.toLowerCase())
    return [
      `Client answer for ${deal.company_name}`,
      ``,
      `Current stage: ${deal.stage}.`,
      `Pipeline value: ${context.fmtSAR(deal.quotation_value)} with ${deal.probability}% probability.`,
      `Owner: ${deal.sales_exec_name}. Collection status: ${deal.collection_status ?? 'Not set'}.`,
      `Contract status: ${deal.contract_status ?? 'Not set'}.`,
      `Notes: ${deal.comments?.trim() || 'No internal notes stored.'}`,
      `Client feedback: ${feedback ? `${feedback.feedback_text} (rating ${feedback.rating}/5).` : 'No client feedback entry found.'}`,
    ].join('\n')
  }

  const rep = context.reps.find((item) => question.toLowerCase().includes(item.name.toLowerCase()))
  if (rep) {
    return [
      `Rep answer for ${rep.name}`,
      ``,
      `${rep.name} is tracking ${context.fmtSAR(rep.secured)} secured revenue against a ${context.fmtSAR(rep.monthly_target)} target.`,
      `Pipeline coverage: ${rep.opps} opportunities, ${rep.pending} pending, ${rep.closed} closed, ${rep.lost_deals} lost.`,
      `Close rate: ${rep.close_rate}% and average deal size ${context.fmtSAR(rep.avg_deal)}.`,
    ].join('\n')
  }

  const top = topDeals(context, 5)
  return [
    `General answer`,
    ``,
    `I could not map that question to one client or rep from the current dataset. Ask about a company name or rep name and I will answer from the page data.`,
    `Top open opportunities right now:`,
    ...top.map((item) => `- ${item.company_name} in ${item.stage} for ${context.fmtSAR(item.quotation_value)}`),
  ].join('\n')
}

function localBot(input: AutomationRunInput): AutomationRunResult {
  const context = buildContext(input)
  const content =
    input.mode === 'summary'
      ? pageSummary(context)
      : input.mode === 'insights'
        ? pageInsights(context)
        : answerQuestion(context, input.question?.trim() || '')

  return {
    content,
    providerUsed: 'local',
    fallbackUsed: false,
  }
}

function systemPrompt(input: AutomationRunInput) {
  const context = buildContext(input)
  const top = topDeals(context, 6)
  const stale = staleDeals(context, 10)
  const overdue = overdueDeals(context)

  return [
    `You are an automation analyst inside a KSA sales operations dashboard.`,
    `Current page: ${context.pageLabel} (${context.pageId}).`,
    `You must answer only from the provided dashboard data.`,
    `If the user asks a client question and the client is not in the data, say that plainly.`,
    `Use concise business language and bullet lists when useful.`,
    ``,
    `Dataset snapshot:`,
    `- Active deals: ${context.activeDeals.length}`,
    `- Total deals: ${context.allDeals.length}`,
    `- Reps: ${context.reps.length}`,
    `- Feedback entries: ${context.feedbacks.length}`,
    `- Stale deals 10d+: ${stale.length}`,
    `- Overdue collections: ${overdue.length}`,
    `- Total active pipeline: ${context.fmtSAR(context.activeDeals.reduce((sum, deal) => sum + deal.quotation_value, 0))}`,
    `- Top opportunities: ${top.map((deal) => `${deal.company_name} (${deal.stage}, ${context.fmtSAR(deal.quotation_value)})`).join('; ') || 'none'}`,
    ``,
    `Detailed records:`,
    JSON.stringify(
      {
        deals: context.allDeals,
        reps: context.reps,
        feedbacks: context.feedbacks,
      },
      null,
      2
    ),
  ].join('\n')
}

async function callOpenAICompatible(input: AutomationRunInput, baseUrl: string, providerLabel: string, apiKey?: string) {
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({
      model: input.settings.automationModel,
      temperature: input.settings.automationTemperature,
      messages: [
        { role: 'system', content: systemPrompt(input) },
        {
          role: 'user',
          content:
            input.mode === 'summary'
              ? 'Summarize the current page for an operator.'
              : input.mode === 'insights'
                ? 'Give me the most useful operational insights and risks from this page.'
                : `Answer this client or operator question: ${input.question}`,
        },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`${providerLabel} request failed with ${response.status}`)
  }

  const data = await response.json()
  return data?.choices?.[0]?.message?.content?.trim() || ''
}

async function callAnthropic(input: AutomationRunInput, apiKey: string) {
  const response = await fetch(`${(input.settings.automationBaseUrl || 'https://api.anthropic.com/v1').replace(/\/$/, '')}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: input.settings.automationModel,
      max_tokens: 900,
      temperature: input.settings.automationTemperature,
      system: systemPrompt(input),
      messages: [
        {
          role: 'user',
          content:
            input.mode === 'summary'
              ? 'Summarize the current page for an operator.'
              : input.mode === 'insights'
                ? 'Give me the most useful operational insights and risks from this page.'
                : `Answer this client or operator question: ${input.question}`,
        },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`Anthropic request failed with ${response.status}`)
  }

  const data = await response.json()
  const content = Array.isArray(data?.content) ? data.content.map((item: { text?: string }) => item.text || '').join('\n').trim() : ''
  return content
}

async function callCloudflareAI(input: AutomationRunInput): Promise<string> {
  const model = input.settings.automationModel || '@cf/meta/llama-3.1-8b-instruct'
  const response = await fetch('/api/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      temperature: input.settings.automationTemperature,
      max_tokens: 1200,
      messages: [
        { role: 'system', content: systemPrompt(input) },
        {
          role: 'user',
          content:
            input.mode === 'summary'
              ? 'Summarize the current page for an operations manager. Be specific with numbers.'
              : input.mode === 'insights'
                ? 'Give me the top operational insights, risks, and recommendations from this data. Use numbered points.'
                : `Answer this question from the sales dashboard data: ${input.question}`,
        },
      ],
    }),
  })

  if (!response.ok) {
    const err = await response.text().catch(() => response.statusText)
    throw new Error(`Cloudflare AI error ${response.status}: ${err}`)
  }

  const data = await response.json()
  return data?.choices?.[0]?.message?.content?.trim() || ''
}

export async function runAutomationBot(input: AutomationRunInput): Promise<AutomationRunResult> {
  const provider = input.settings.automationProvider
  if (provider === 'local') return localBot(input)

  if (provider === 'cloudflare') {
    try {
      const content = await callCloudflareAI(input)
      return { content: content || localBot(input).content, providerUsed: 'cloudflare', fallbackUsed: !content }
    } catch (error) {
      if (!input.settings.automationAutoFallback) {
        return {
          content: error instanceof Error ? error.message : 'Cloudflare AI request failed.',
          providerUsed: 'cloudflare',
          fallbackUsed: false,
        }
      }
      return {
        ...localBot(input),
        fallbackUsed: true,
        warning: error instanceof Error ? `Cloudflare AI failed, local engine answered instead: ${error.message}` : 'Cloudflare AI failed, using local engine.',
      }
    }
  }

  try {
    if (provider === 'anthropic') {
      if (!input.settings.automationApiKey) throw new Error('Anthropic API key is missing.')
      const content = await callAnthropic(input, input.settings.automationApiKey)
      return {
        content: content || localBot(input).content,
        providerUsed: 'anthropic',
        fallbackUsed: false,
      }
    }

    const baseUrl =
      provider === 'openai'
        ? input.settings.automationBaseUrl || 'https://api.openai.com/v1'
        : provider === 'ollama'
          ? input.settings.automationBaseUrl || 'http://localhost:11434/v1'
          : input.settings.automationBaseUrl || 'http://localhost:11434/v1'

    const content = await callOpenAICompatible(input, baseUrl, provider, input.settings.automationApiKey)
    return {
      content: content || localBot(input).content,
      providerUsed: provider,
      fallbackUsed: false,
    }
  } catch (error) {
    const fallback = localBot(input)
    if (!input.settings.automationAutoFallback) {
      return {
        content: error instanceof Error ? error.message : 'Automation provider failed.',
        providerUsed: provider,
        fallbackUsed: false,
      }
    }

    return {
      ...fallback,
      fallbackUsed: true,
      warning: error instanceof Error ? `${provider} failed, local automation answered instead.` : 'Provider failed, local automation answered instead.',
    }
  }
}

