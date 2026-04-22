import { useMemo, useState } from 'react'
import { CheckCircle2, Clock3, FileText, MessageSquareMore } from 'lucide-react'

import type { Deal } from '../lib/supabase'

interface ActivityFeedProps {
  deal: Deal
}

interface FeedItem {
  id: string
  label: string
  detail: string
  time: string
  tone: 'neutral' | 'good' | 'alert'
}

function buildSystemItems(deal: Deal): FeedItem[] {
  return [
    {
      id: `${deal.id}-stage`,
      label: 'Stage updated',
      detail: `Deal is currently in ${deal.stage}.`,
      time: `${deal.days_in_stage} days in stage`,
      tone: deal.days_in_stage > 10 ? 'alert' : 'neutral',
    },
    {
      id: `${deal.id}-probability`,
      label: 'Forecast confidence',
      detail: `${deal.probability}% probability on ${deal.company_name}.`,
      time: 'Forecast signal',
      tone: deal.probability >= 60 ? 'good' : 'neutral',
    },
    {
      id: `${deal.id}-contract`,
      label: 'Contract status',
      detail: deal.contract_status ? `Contract marked as ${deal.contract_status}.` : 'No contract status set yet.',
      time: 'Commercial track',
      tone: deal.contract_status === 'Signed' ? 'good' : 'neutral',
    },
  ]
}

export default function ActivityFeed({ deal }: ActivityFeedProps) {
  const [draft, setDraft] = useState('')
  const [notes, setNotes] = useState<FeedItem[]>([])

  const items = useMemo(() => [...notes, ...buildSystemItems(deal)], [deal, notes])

  const submitNote = () => {
    const value = draft.trim()
    if (!value) return

    setNotes((current) => [
      {
        id: `${deal.id}-note-${current.length + 1}`,
        label: 'Manual note',
        detail: value,
        time: 'Just now',
        tone: 'neutral',
      },
      ...current,
    ])
    setDraft('')
  }

  return (
    <div className="activity-feed">
      <div className="activity-feed-composer">
        <textarea
          className="field activity-feed-input"
          placeholder="Add next step, call summary, or approval note..."
          rows={3}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <button className="btn btn-primary" type="button" onClick={submitNote}>
          Save Note
        </button>
      </div>
      <div className="activity-feed-list">
        {items.map((item) => (
          <div key={item.id} className={`activity-item activity-item-${item.tone}`}>
            <div className="activity-item-icon">
              {item.label === 'Manual note' ? <MessageSquareMore size={16} /> : item.tone === 'good' ? <CheckCircle2 size={16} /> : item.tone === 'alert' ? <Clock3 size={16} /> : <FileText size={16} />}
            </div>
            <div className="activity-item-copy">
              <strong>{item.label}</strong>
              <p>{item.detail}</p>
            </div>
            <span className="activity-item-time">{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
