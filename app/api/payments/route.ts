import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { payments, tenants, units, properties } from '@/lib/schema'
import { eq, and, desc } from 'drizzle-orm'

// GET /api/payments - List all payments for user's tenants
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Pagination parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100) // Max 100 per page
    const offset = (page - 1) * limit

    const result = await db
      .select({
        payment: payments,
        tenant: tenants,
        unit: units,
        property: properties,
      })
      .from(payments)
      .innerJoin(tenants, eq(payments.tenantId, tenants.id))
      .leftJoin(units, eq(tenants.unitId, units.id))
      .leftJoin(properties, eq(units.propertyId, properties.id))
      .where(eq(properties.userId, session.user.id))
      .orderBy(desc(payments.paymentDate))
      .limit(limit)
      .offset(offset)

    return NextResponse.json({
      payments: result,
      pagination: {
        page,
        limit,
        hasMore: result.length === limit
      }
    })
  } catch (error) {
    console.error('Failed to fetch payments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/payments - Record new payment
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tenantId, amount, paymentDate, paymentMethod, notes } = body

    if (!tenantId || !amount || !paymentDate) {
      return NextResponse.json(
        { error: 'Tenant ID, amount, and payment date are required' },
        { status: 400 }
      )
    }

    // Verify tenant ownership
    // FIXED: Handle tenants without units (unitId can be null)
    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, tenantId),
      with: {
        unit: {
          with: {
            property: true
          }
        }
      }
    })

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
    }

    // Check ownership: Either tenant has no unit (allowed), or unit's property belongs to user
    if (tenant.unit && tenant.unit.property?.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized access to tenant' }, { status: 403 })
    }

    // If tenant has no unit, we need to verify they belong to this user via another method
    // For now, only allow recording payments for tenants with assigned units
    if (!tenant.unitId) {
      return NextResponse.json(
        { error: 'Cannot record payment for tenant without assigned unit' },
        { status: 400 }
      )
    }

    const [payment] = await db
      .insert(payments)
      .values({
        tenantId,
        amount: String(amount),
        paymentDate,
        paymentMethod: paymentMethod?.trim() || null,
        notes: notes?.trim() || null,
      })
      .returning()

    return NextResponse.json({ payment }, { status: 201 })
  } catch (error) {
    console.error('Failed to record payment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
