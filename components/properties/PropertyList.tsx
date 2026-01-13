'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { showSuccess, showError } from '@/lib/toast'

type Property = {
  id: string
  name: string
  address: string | null
  notes: string | null
  createdAt: Date | null
  updatedAt?: Date | null
}

export default function PropertyList({ initialProperties }: { initialProperties: Property[] }) {
  const [properties, setProperties] = useState(initialProperties)
  const [deleting, setDeleting] = useState<string | null>(null)
  const router = useRouter()

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this property? This will also delete all units, tenants, and maintenance requests.')) {
      return
    }

    setDeleting(id)
    try {
      const res = await fetch(`/api/properties/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')

      setProperties(properties.filter(p => p.id !== id))
      showSuccess('Property deleted successfully')
    } catch (error) {
      console.error(error)
      showError('Failed to delete property')
    } finally {
      setDeleting(null)
    }
  }

  if (properties.length === 0) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-12 text-center">
        <h3 className="text-lg font-semibold mb-2">No properties yet</h3>
        <p className="text-slate-400 mb-4">Create your first property to get started</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {properties.map((property) => (
        <div
          key={property.id}
          className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 hover:border-blue-500 transition"
        >
          <h3 className="text-lg font-semibold mb-2">{property.name}</h3>
          {property.address && (
            <p className="text-sm text-slate-400 mb-3">{property.address}</p>
          )}
          {property.notes && (
            <p className="text-sm text-slate-300 mb-4 line-clamp-2">{property.notes}</p>
          )}
          <div className="flex gap-2">
            <Link
              href={`/properties/${property.id}`}
              className="flex-1 rounded bg-blue-600 px-3 py-2 text-sm font-medium text-center hover:bg-blue-700 transition"
            >
              View Details
            </Link>
            <button
              onClick={() => handleDelete(property.id)}
              disabled={deleting === property.id}
              className="rounded bg-red-600 px-3 py-2 text-sm font-medium hover:bg-red-700 transition disabled:opacity-50"
            >
              {deleting === property.id ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
