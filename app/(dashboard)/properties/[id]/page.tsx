import { auth } from '@/lib/auth'
import { redirect, notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { properties, units } from '@/lib/schema'
import { eq, and } from 'drizzle-orm'
import PropertyDetails from '@/components/properties/PropertyDetails'
import UnitsList from '@/components/units/UnitsList'
import CreateUnitButton from '@/components/units/CreateUnitButton'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const { id } = await params

  const [property] = await db
    .select()
    .from(properties)
    .where(and(eq(properties.id, id), eq(properties.userId, session.user.id)))
    .limit(1)

  if (!property) {
    notFound()
  }

  const propertyUnits = await db
    .select()
    .from(units)
    .where(eq(units.propertyId, id))
    .orderBy(units.unitNumber)

  return (
    <div className="p-6">
      <PropertyDetails property={property} />

      <div className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Units</h2>
          <CreateUnitButton propertyId={id} />
        </div>
        <UnitsList initialUnits={propertyUnits} propertyId={id} />
      </div>
    </div>
  )
}
