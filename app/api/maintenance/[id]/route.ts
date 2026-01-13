import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { maintenanceRequests, units, properties } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'

type RouteParams = { params: Promise<{ id: string }> }

// PATCH /api/maintenance/[id] - Update maintenance request (mainly for status/resolution)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, priority, resolutionNotes } = body

    // Verify ownership
    const result = await db
      .select()
      .from(maintenanceRequests)
      .innerJoin(units, eq(maintenanceRequests.unitId, units.id))
      .innerJoin(properties, eq(units.propertyId, properties.id))
      .where(and(eq(maintenanceRequests.id, id), eq(properties.userId, session.user.id)))
      .limit(1)

    if (result.length === 0) {
      return NextResponse.json({ error: 'Maintenance request not found' }, { status: 404 })
    }

    const updateData: any = { updatedAt: new Date() }
    if (status !== undefined) {
      updateData.status = status
      if (status === 'resolved') {
        updateData.resolvedAt = new Date()
      }
    }
    if (priority !== undefined) updateData.priority = priority
    if (resolutionNotes !== undefined) updateData.resolutionNotes = resolutionNotes?.trim() || null

    const [maintenanceRequest] = await db
      .update(maintenanceRequests)
      .set(updateData)
      .where(eq(maintenanceRequests.id, id))
      .returning()

    return NextResponse.json({ request: maintenanceRequest })
  } catch (error) {
    console.error('Failed to update maintenance request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/maintenance/[id] - Delete maintenance request
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership
    const result = await db
      .select()
      .from(maintenanceRequests)
      .innerJoin(units, eq(maintenanceRequests.unitId, units.id))
      .innerJoin(properties, eq(units.propertyId, properties.id))
      .where(and(eq(maintenanceRequests.id, id), eq(properties.userId, session.user.id)))
      .limit(1)

    if (result.length === 0) {
      return NextResponse.json({ error: 'Maintenance request not found' }, { status: 404 })
    }

    await db.delete(maintenanceRequests).where(eq(maintenanceRequests.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete maintenance request:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
