import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { tenants, units, properties } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'

type RouteParams = { params: Promise<{ id: string }> }

// GET /api/tenants/[id] - Get single tenant
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get tenant with ownership verification
    const result = await db
      .select()
      .from(tenants)
      .leftJoin(units, eq(tenants.unitId, units.id))
      .leftJoin(properties, eq(units.propertyId, properties.id))
      .where(
        and(
          eq(tenants.id, id),
          eq(properties.userId, session.user.id)
        )
      )
      .limit(1)

    if (result.length === 0) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    return NextResponse.json({ tenant: result[0].tenants })
  } catch (error) {
    console.error('Failed to fetch tenant:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/tenants/[id] - Update tenant
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { unitId, name, email, phone, leaseStart, leaseEnd, status, moveOutDate, notes } = body

    // Verify ownership
    const result = await db
      .select()
      .from(tenants)
      .leftJoin(units, eq(tenants.unitId, units.id))
      .leftJoin(properties, eq(units.propertyId, properties.id))
      .where(
        and(
          eq(tenants.id, id),
          eq(properties.userId, session.user.id)
        )
      )
      .limit(1)

    if (result.length === 0) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // If changing unitId, verify new unit ownership
    if (unitId !== undefined && unitId !== null) {
      const unitResult = await db
        .select()
        .from(units)
        .innerJoin(properties, eq(units.propertyId, properties.id))
        .where(and(eq(units.id, unitId), eq(properties.userId, session.user.id)))
        .limit(1)

      if (unitResult.length === 0) {
        return NextResponse.json({ error: 'Unit not found' }, { status: 404 })
      }
    }

    const updateData: any = { updatedAt: new Date() }
    if (unitId !== undefined) updateData.unitId = unitId || null
    if (name !== undefined) updateData.name = name.trim()
    if (email !== undefined) updateData.email = email?.trim() || null
    if (phone !== undefined) updateData.phone = phone?.trim() || null
    if (leaseStart !== undefined) updateData.leaseStart = leaseStart || null
    if (leaseEnd !== undefined) updateData.leaseEnd = leaseEnd || null
    if (status !== undefined) updateData.status = status
    if (moveOutDate !== undefined) updateData.moveOutDate = moveOutDate || null
    if (notes !== undefined) updateData.notes = notes?.trim() || null

    const [tenant] = await db
      .update(tenants)
      .set(updateData)
      .where(eq(tenants.id, id))
      .returning()

    return NextResponse.json({ tenant })
  } catch (error) {
    console.error('Failed to update tenant:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/tenants/[id] - Delete tenant
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
      .from(tenants)
      .leftJoin(units, eq(tenants.unitId, units.id))
      .leftJoin(properties, eq(units.propertyId, properties.id))
      .where(
        and(
          eq(tenants.id, id),
          eq(properties.userId, session.user.id)
        )
      )
      .limit(1)

    if (result.length === 0) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    await db.delete(tenants).where(eq(tenants.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete tenant:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
