import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all leads for the user
    const { data: leads, error } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
    }

    return NextResponse.json(leads)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, status } = await request.json()

    if (!id || !status) {
      return NextResponse.json(
        { error: 'ID and status are required' },
        { status: 400 }
      )
    }

    // Verify ownership
    const { data: lead } = await supabase
      .from('leads')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!lead || lead.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update status
    const { data: updatedLead, error } = await supabase
      .from('leads')
      .update({ status })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })
    }

    return NextResponse.json(updatedLead)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}
