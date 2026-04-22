import { Bell, CircleAlert, CircleCheckBig, Clock3 } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'

interface NotificationItem {
  id: string
  title: string
  detail: string
  tone: 'alert' | 'success' | 'neutral'
}

interface NotificationBellProps {
  items: NotificationItem[]
}

export default function NotificationBell({ items }: NotificationBellProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="btn-icon notification-trigger" type="button" aria-label="Open alerts">
          <Bell size={16} />
          {items.length > 0 ? <span className="notification-count">{items.length}</span> : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="notification-menu">
        <DropdownMenuLabel>Workspace Alerts</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <DropdownMenuItem disabled>No pending alerts</DropdownMenuItem>
        ) : (
          items.map((item) => (
            <DropdownMenuItem key={item.id} className="notification-item">
              <span className={`notification-item-icon notification-item-${item.tone}`}>
                {item.tone === 'alert' ? <CircleAlert size={14} /> : item.tone === 'success' ? <CircleCheckBig size={14} /> : <Clock3 size={14} />}
              </span>
              <div className="notification-item-copy">
                <strong>{item.title}</strong>
                <span>{item.detail}</span>
              </div>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
