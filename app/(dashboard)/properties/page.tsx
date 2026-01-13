import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { properties } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import PropertyList from '@/components/properties/PropertyList'
import CreatePropertyButton from '@/components/properties/CreatePropertyButton'

export default async function PropertiesPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect('/login')
  }

  const userProperties = await db
    .select()
    .from(properties)
    .where(eq(properties.userId, session.user.id))
    .orderBy(properties.createdAt)

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Properties</h1>
          <p className="text-slate-400">Manage your rental properties</p>
        </div>
        <CreatePropertyButton />
      </div>

      <PropertyList initialProperties={userProperties} />
    </div>
  )
}
