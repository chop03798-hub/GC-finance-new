interface Env {
  AI: Ai
}

interface RequestBody {
  messages: Array<{ role: string; content: string }>
  model?: string
  max_tokens?: number
  temperature?: number
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context

  // CORS preflight
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  let body: RequestBody
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }

  const model = (body.model as BaseAiTextGenerationModels) || '@cf/meta/llama-3.1-8b-instruct'
  const messages = body.messages ?? []

  if (!messages.length) {
    return new Response(JSON.stringify({ error: 'messages array is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }

  try {
    const result = await env.AI.run(model, {
      messages,
      max_tokens: body.max_tokens ?? 1024,
      temperature: body.temperature ?? 0.3,
    } as AiTextGenerationInput)

    const content =
      typeof result === 'object' && result !== null && 'response' in result
        ? (result as { response: string }).response
        : typeof result === 'string'
          ? result
          : JSON.stringify(result)

    return new Response(
      JSON.stringify({
        choices: [{ message: { role: 'assistant', content: content ?? '' } }],
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Workers AI request failed'
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
}

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
