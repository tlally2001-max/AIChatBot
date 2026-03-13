'use client'

import { Lead } from '@/types'
import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'

interface LeadCardProps {
  lead: Lead
}

export function LeadCard({ lead }: LeadCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: lead.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const statusColors = {
    new_lead: 'bg-gray-100',
    scraped: 'bg-blue-100',
    demo_sent: 'bg-yellow-100',
    demo_opened: 'bg-green-100',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${statusColors[lead.status]} p-4 rounded-lg cursor-move shadow hover:shadow-lg transition-shadow`}
    >
      <h3 className="font-semibold text-gray-900 truncate">{lead.business_name || 'Unknown'}</h3>
      <p className="text-sm text-gray-600 truncate">{lead.url}</p>

      {lead.prospect_email && (
        <p className="text-xs text-gray-500 mt-2">{lead.prospect_email}</p>
      )}

      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {new Date(lead.created_at).toLocaleDateString()}
        </span>
        <span
          className={`text-xs font-medium px-2 py-1 rounded ${
            lead.status === 'new_lead'
              ? 'bg-gray-200 text-gray-800'
              : lead.status === 'scraped'
              ? 'bg-blue-200 text-blue-800'
              : lead.status === 'demo_sent'
              ? 'bg-yellow-200 text-yellow-800'
              : 'bg-green-200 text-green-800'
          }`}
        >
          {lead.status.replace('_', ' ')}
        </span>
      </div>
    </div>
  )
}
