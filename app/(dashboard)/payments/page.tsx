import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { payments, tenants, units, properties } from '@/lib/schema'
import { eq, desc } from 'drizzle-orm'
import PaymentsList from '@/components/payments/PaymentsList'
import RecordPaymentButton from '@/components/payments/RecordPaymentButton'

export default async function PaymentsPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  // Get all payments with full context
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

  // Get all active tenants for the payment form
  const activeTenants = await db
    .select({
      tenant: tenants,
      unit: units,
      property: properties,
    })
    .from(tenants)
    .leftJoin(units, eq(tenants.unitId, units.id))
    .leftJoin(properties, eq(units.propertyId, properties.id))
    .where(eq(properties.userId, session.user.id))
    .orderBy(tenants.name)

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payments</h1>
          <p className="text-slate-400">Track rent and other payments</p>
        </div>
        <RecordPaymentButton tenants={activeTenants} />
      </div>

      <PaymentsList initialPayments={result} />
    </div>
  )
}
