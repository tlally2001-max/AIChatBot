'use client'

import { Lead, LeadStatus } from '@/types'
import { LeadCard } from './LeadCard'
import { useDroppable } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

interface PipelineColumnProps {
  status: LeadStatus
  leads: Lead[]
  title: string
}

export function PipelineColumn({ status, leads, title }: PipelineColumnProps) {
  const { setNodeRef } = useDroppable({ id: status })

  return (
    <div className="bg-gray-50 rounded-lg p-4 flex-1 min-w-0">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{leads.length} leads</p>
      </div>

      <div
        ref={setNodeRef}
        className="space-y-3 min-h-96 bg-white rounded p-2"
      >
        <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
          {leads.length > 0 ? (
            leads.map((lead) => <LeadCard key={lead.id} lead={lead} />)
          ) : (
            <div className="text-center py-8 text-gray-400 text-sm">
              No leads yet
            </div>
          )}
        </SortableContext>
      </div>
    </div>
  )
}
