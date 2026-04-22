import { Building2, CalendarClock, CircleDollarSign, UserRound } from 'lucide-react'

import type { Deal } from '../lib/supabase'
import ActivityFeed from './ActivityFeed'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './ui/sheet'

interface RecordPanelProps {
  deal: Deal | null
  open: boolean
  onOpenChange: (open: boolean) => void
  fmtSAR: (value: number) => string
}

export default function RecordPanel({ deal, open, onOpenChange, fmtSAR }: RecordPanelProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="record-panel-sheet">
        {deal ? (
          <div className="record-panel">
            <SheetHeader className="record-panel-header">
              <div className="record-panel-chip">Deal Detail</div>
              <SheetTitle className="record-panel-title">{deal.company_name}</SheetTitle>
              <SheetDescription className="record-panel-subtitle">
                {deal.business_type} · {deal.stage}
              </SheetDescription>
            </SheetHeader>

            <div className="record-panel-summary">
              <div className="record-panel-stat">
                <CircleDollarSign size={18} />
                <div>
                  <span>Quotation Value</span>
                  <strong>{fmtSAR(deal.quotation_value)}</strong>
                </div>
              </div>
              <div className="record-panel-stat">
                <UserRound size={18} />
                <div>
                  <span>Salesman</span>
                  <strong>{deal.sales_exec_name}</strong>
                </div>
              </div>
              <div className="record-panel-stat">
                <Building2 size={18} />
                <div>
                  <span>Contact</span>
                  <strong>{deal.contact_person}</strong>
                </div>
              </div>
              <div className="record-panel-stat">
                <CalendarClock size={18} />
                <div>
                  <span>Next Window</span>
                  <strong>{deal.contract_expiry || deal.date}</strong>
                </div>
              </div>
            </div>

            <div className="record-panel-grid">
              <div className="record-panel-block">
                <div className="section-title">Commercial Snapshot</div>
                <dl className="record-panel-fields">
                  <div><dt>Group</dt><dd>{deal.parent_company_name || 'Not set'}</dd></div>
                  <div><dt>Brand</dt><dd>{deal.brand_name || 'Not set'}</dd></div>
                  <div><dt>Probability</dt><dd>{deal.probability}%</dd></div>
                  <div><dt>Days in Stage</dt><dd>{deal.days_in_stage}</dd></div>
                  <div><dt>Priority</dt><dd>{deal.priority}</dd></div>
                  <div><dt>Collection</dt><dd>{deal.collection_status || 'Pending'}</dd></div>
                  <div><dt>Contract</dt><dd>{deal.contract_status || 'No Contract'}</dd></div>
                  <div><dt>Monthly Value</dt><dd>{fmtSAR(deal.monthly_value || 0)}</dd></div>
                </dl>
              </div>
              <div className="record-panel-block">
                <div className="section-title">Notes</div>
                <p className="record-panel-note">{deal.comments?.trim() || 'No notes added yet.'}</p>
              </div>
            </div>

            <div className="record-panel-block">
              <div className="section-title">Activity Feed</div>
              <ActivityFeed deal={deal} />
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
