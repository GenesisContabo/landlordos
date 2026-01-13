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

    return NextResponse.json({ payments: result })
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
    const result = await db
      .select()
      .from(tenants)
      .leftJoin(units, eq(tenants.unitId, units.id))
      .leftJoin(properties, eq(units.propertyId, properties.id))
      .where(and(eq(tenants.id, tenantId), eq(properties.userId, session.user.id)))
      .limit(1)

    if (result.length === 0) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 })
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
