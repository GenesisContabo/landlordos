import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { properties, units, tenants, payments, maintenanceRequests } from '@/lib/schema'
import { eq, and, sql, desc } from 'drizzle-orm'
import Link from 'next/link'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  // Get counts
  const [propertiesCount] = await db.select({ count: sql<number>`cast(count(*) as integer)` })
    .from(properties).where(eq(properties.userId, session.user.id))

  const [unitsCount] = await db.select({ count: sql<number>`cast(count(*) as integer)` })
    .from(units)
    .innerJoin(properties, eq(units.propertyId, properties.id))
    .where(eq(properties.userId, session.user.id))

  const [tenantsCount] = await db.select({ count: sql<number>`cast(count(*) as integer)` })
    .from(tenants)
    .leftJoin(units, eq(tenants.unitId, units.id))
    .leftJoin(properties, eq(units.propertyId, properties.id))
    .where(eq(properties.userId, session.user.id))

  const [openMaintenanceCount] = await db.select({ count: sql<number>`cast(count(*) as integer)` })
    .from(maintenanceRequests)
    .innerJoin(units, eq(maintenanceRequests.unitId, units.id))
    .innerJoin(properties, eq(units.propertyId, properties.id))
    .where(and(eq(properties.userId, session.user.id), eq(maintenanceRequests.status, 'open')))

  // Get recent payments (last 5)
  const recentPayments = await db.select({
      payment: payments,
      tenant: tenants,
    })
    .from(payments)
    .innerJoin(tenants, eq(payments.tenantId, tenants.id))
    .leftJoin(units, eq(tenants.unitId, units.id))
    .leftJoin(properties, eq(units.propertyId, properties.id))
    .where(eq(properties.userId, session.user.id))
    .orderBy(desc(payments.paymentDate))
    .limit(5)

  const totalRevenue = recentPayments.reduce((sum, r) => sum + parseFloat(r.payment.amount), 0)

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-slate-400">Welcome back, {session.user?.name}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Link href="/properties" className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 hover:border-blue-500 transition">
          <p className="text-sm text-slate-400 mb-1">Properties</p>
          <p className="text-3xl font-bold">{propertiesCount.count}</p>
        </Link>
        <Link href="/properties" className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 hover:border-blue-500 transition">
          <p className="text-sm text-slate-400 mb-1">Units</p>
          <p className="text-3xl font-bold">{unitsCount.count}</p>
        </Link>
        <Link href="/tenants" className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 hover:border-blue-500 transition">
          <p className="text-sm text-slate-400 mb-1">Tenants</p>
          <p className="text-3xl font-bold">{tenantsCount.count}</p>
        </Link>
        <Link href="/maintenance" className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 hover:border-orange-500 transition">
          <p className="text-sm text-slate-400 mb-1">Open Maintenance</p>
          <p className="text-3xl font-bold text-orange-400">{openMaintenanceCount.count}</p>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Payments */}
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Payments</h2>
            <Link href="/payments" className="text-sm text-blue-500 hover:text-blue-400">View all →</Link>
          </div>
          {recentPayments.length === 0 ? (
            <p className="text-sm text-slate-400">No payments recorded yet</p>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-sm text-slate-400">Total (Last 5)</p>
                <p className="text-2xl font-bold text-green-400">${totalRevenue.toFixed(2)}</p>
              </div>
              <div className="space-y-2">
                {recentPayments.map(({ payment, tenant }) => (
                  <div key={payment.id} className="flex items-center justify-between border-t border-slate-700 pt-2">
                    <div>
                      <p className="text-sm font-medium">{tenant.name}</p>
                      <p className="text-xs text-slate-400">{new Date(payment.paymentDate).toLocaleDateString()}</p>
                    </div>
                    <p className="text-sm font-semibold text-green-400">${parseFloat(payment.amount).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link href="/properties" className="block rounded bg-blue-600 px-4 py-3 text-center font-medium hover:bg-blue-700 transition">
              Manage Properties
            </Link>
            <Link href="/tenants" className="block rounded bg-blue-600 px-4 py-3 text-center font-medium hover:bg-blue-700 transition">
              Manage Tenants
            </Link>
            <Link href="/payments" className="block rounded bg-green-600 px-4 py-3 text-center font-medium hover:bg-green-700 transition">
              Record Payment
            </Link>
            <Link href="/maintenance" className="block rounded bg-orange-600 px-4 py-3 text-center font-medium hover:bg-orange-700 transition">
              Create Maintenance Request
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
