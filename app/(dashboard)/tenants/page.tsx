import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { tenants, units, properties } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import TenantsList from '@/components/tenants/TenantsList'
import CreateTenantButton from '@/components/tenants/CreateTenantButton'

export default async function TenantsPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  // Get all tenants with their unit/property info
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
    .orderBy(tenants.name)

  // Get all user's units for the create form
  const userUnits = await db
    .select({
      unit: units,
      property: properties,
    })
    .from(units)
    .innerJoin(properties, eq(units.propertyId, properties.id))
    .where(eq(properties.userId, session.user.id))
    .orderBy(properties.name, units.unitNumber)

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tenants</h1>
          <p className="text-slate-400">Manage your tenants and leases</p>
        </div>
        <CreateTenantButton units={userUnits} />
      </div>

      <TenantsList initialTenants={result} />
    </div>
  )
}
