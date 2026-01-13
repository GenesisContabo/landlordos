import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { maintenanceRequests, units, properties } from '@/lib/schema'
import { eq, desc } from 'drizzle-orm'
import MaintenanceRequestsList from '@/components/maintenance/MaintenanceRequestsList'
import CreateMaintenanceButton from '@/components/maintenance/CreateMaintenanceButton'

export default async function MaintenancePage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const result = await db
    .select({
      request: maintenanceRequests,
      unit: units,
      property: properties,
    })
    .from(maintenanceRequests)
    .innerJoin(units, eq(maintenanceRequests.unitId, units.id))
    .innerJoin(properties, eq(units.propertyId, properties.id))
    .where(eq(properties.userId, session.user.id))
    .orderBy(desc(maintenanceRequests.createdAt))

  // Get all units for create form
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
          <h1 className="text-2xl font-bold">Maintenance Requests</h1>
          <p className="text-slate-400">Track and manage property maintenance</p>
        </div>
        <CreateMaintenanceButton units={userUnits} />
      </div>

      <MaintenanceRequestsList initialRequests={result} />
    </div>
  )
}
