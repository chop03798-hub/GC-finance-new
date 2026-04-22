import appDeveloperRaw from '../../.agent.md?raw'
import uiUxRaw from '../../ui-ux-designer.agent.md?raw'
import supabaseRaw from '../../supabase-specialist.agent.md?raw'
import testingRaw from '../../testing-agent.agent.md?raw'

export interface AgentProfile {
  id: string
  name: string
  file: string
  description: string
  roleBullets: string[]
  toolPreferences: string[]
  principles: string[]
  healthy: boolean
  healthNotes: string[]
}

function sectionLines(source: string, heading: string) {
  const match = source.match(new RegExp(`## ${heading}\\s+([\\s\\S]*?)(?:\\n## |$)`))
  if (!match) return []
  return match[1]
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '))
    .map((line) => line.slice(2).trim())
}

function paragraphAfter(source: string, heading: string) {
  const match = source.match(new RegExp(`## ${heading}\\s+([\\s\\S]*?)(?:\\n## |$)`))
  return match?.[1]?.trim().split('\n').find((line) => line.trim().length > 0 && !line.startsWith('- '))?.trim() ?? ''
}

function buildProfile(id: string, file: string, raw: string): AgentProfile {
  const name = raw.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? id
  const description = paragraphAfter(raw, 'Description')
  const roleBullets = sectionLines(raw, 'Role')
  const toolPreferences = sectionLines(raw, 'Tool Preferences')
  const principles = sectionLines(raw, 'Principles')
  const healthNotes = []

  if (!description) healthNotes.push('Missing description section.')
  if (roleBullets.length === 0) healthNotes.push('Missing role responsibilities.')
  if (toolPreferences.length === 0) healthNotes.push('Missing tool preference guidance.')
  if (principles.length === 0) healthNotes.push('Missing principles section.')

  return {
    id,
    name,
    file,
    description,
    roleBullets,
    toolPreferences,
    principles,
    healthy: healthNotes.length === 0,
    healthNotes,
  }
}

export const AGENT_PROFILES: AgentProfile[] = [
  buildProfile('gc-ksa', '.agent.md', appDeveloperRaw),
  buildProfile('ui-ux', 'ui-ux-designer.agent.md', uiUxRaw),
  buildProfile('supabase', 'supabase-specialist.agent.md', supabaseRaw),
  buildProfile('testing', 'testing-agent.agent.md', testingRaw),
]

