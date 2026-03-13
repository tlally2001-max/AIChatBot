'use client'

import { useEffect, useState } from 'react'
import { Lead, LeadStatus } from '@/types'
import { PipelineColumn } from './PipelineColumn'
import {
  DndContext,
  DragEndEvent,
  closestCorners,
} from '@dnd-kit/core'

interface PipelineBoardProps {
  initialLeads: Lead[]
}

const columns: Array<{ status: LeadStatus; title: string }> = [
  { status: 'new_lead', title: 'New Lead' },
  { status: 'scraped', title: 'Scraped' },
  { status: 'demo_sent', title: 'Demo Sent' },
  { status: 'demo_opened', title: 'Demo Opened' },
]

export function PipelineBoard({ initialLeads }: PipelineBoardProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)

  useEffect(() => {
    setLeads(initialLeads)
  }, [initialLeads])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) return

    const overId = over.id as LeadStatus

    // Find the lead being dragged
    const lead = leads.find(l => l.id === active.id)
    if (!lead || !['new_lead', 'scraped', 'demo_sent', 'demo_opened'].includes(overId)) {
      return
    }

    // Update UI optimistically
    setLeads(
      leads.map(l =>
        l.id === lead.id ? { ...l, status: overId } : l
      )
    )

    // Update in database
    try {
      await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: lead.id, status: overId }),
      })
    } catch (error) {
      console.error('Failed to update lead:', error)
      // Revert on error
      setLeads(leads)
    }
  }

  return (
    <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <PipelineColumn
            key={column.status}
            status={column.status}
            title={column.title}
            leads={leads.filter(l => l.status === column.status)}
          />
        ))}
      </div>
    </DndContext>
  )
}
