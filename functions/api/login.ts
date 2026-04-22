interface Env {
  DEMO_USERS?: string
}

interface DemoUserRecord {
  id: string
  name: string
  email: string
  password: string
  role: string
  region?: string
  repName?: string
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  })
}

function parseDemoUsers(raw: string | undefined): DemoUserRecord[] {
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed as DemoUserRecord[] : []
  } catch {
    return []
  }
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: { email?: string; password?: string }

  try {
    body = await request.json()
  } catch {
    return json({ error: 'Invalid JSON body.' }, 400)
  }

  const email = body.email?.trim().toLowerCase()
  const password = body.password ?? ''

  if (!email || !password) {
    return json({ error: 'Email and password are required.' }, 400)
  }

  const match = parseDemoUsers(env.DEMO_USERS).find(
    (user) => user.email.toLowerCase() === email && user.password === password,
  )

  if (!match) {
    return json({ error: 'Invalid email or password.' }, 401)
  }

  const { password: _password, ...safeUser } = match
  return json({ user: safeUser })
}

export const onRequestOptions: PagesFunction = async () =>
  new Response(null, {
    status: 204,
    headers: corsHeaders,
  })
