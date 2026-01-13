import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { tenants, units, properties } from '@/lib/schema'
import { eq, and, isNull } from 'drizzle-orm'

// GET /api/tenants - List all tenants for user's properties
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all tenants for user's units
    const result = await db
      .select({
        tenant: tenants,
        unit: units,
        property: properties,
      })
      .from(tenants)
      .leftJoin(units, eq(tenants.unitId, units.id))
      .leftJoin(properties, eq(units.propertyId, properties.id))
      .where(eq(properties.userId, session.user.id))
      .orderBy(tenants.createdAt)

    return NextResponse.json({ tenants: result })
  } catch (error) {
    console.error('Failed to fetch tenants:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/tenants - Create new tenant
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { unitId, name, email, phone, leaseStart, leaseEnd, status, notes } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Tenant name is required' }, { status: 400 })
    }

    // If unitId provided, verify ownership
    if (unitId) {
      const result = await db
        .select()
        .from(units)
        .innerJoin(properties, eq(units.propertyId, properties.id))
        .where(and(eq(units.id, unitId), eq(properties.userId, session.user.id)))
        .limit(1)

      if (result.length === 0) {
        return NextResponse.json({ error: 'Unit not found' }, { status: 404 })
      }
    }

    const [tenant] = await db
      .insert(tenants)
      .values({
        unitId: unitId || null,
        name: name.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
        leaseStart: leaseStart || null,
        leaseEnd: leaseEnd || null,
        status: status || 'active',
        notes: notes?.trim() || null,
      })
      .returning()

    return NextResponse.json({ tenant }, { status: 201 })
  } catch (error) {
    console.error('Failed to create tenant:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
