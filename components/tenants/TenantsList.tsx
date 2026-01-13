'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type TenantWithUnit = {
  tenant: {
    id: string
    name: string
    email: string | null
    phone: string | null
    leaseStart: string | null
    leaseEnd: string | null
    status: string | null
    unitId: string | null
  }
  unit: {
    unitNumber: string
  } | null
  property: {
    name: string
  } | null
}

export default function TenantsList({ initialTenants }: { initialTenants: TenantWithUnit[] }) {
  const [tenants, setTenants] = useState(initialTenants)
  const [deleting, setDeleting] = useState<string | null>(null)
  const router = useRouter()

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this tenant? This will also delete all payment records.')) {
      return
    }

    setDeleting(id)
    try {
      const res = await fetch(`/api/tenants/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')

      setTenants(tenants.filter(t => t.tenant.id !== id))
    } catch (error) {
      console.error(error)
      alert('Failed to delete tenant')
    } finally {
      setDeleting(null)
    }
  }

  if (tenants.length === 0) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-12 text-center">
        <h3 className="text-lg font-semibold mb-2">No tenants yet</h3>
        <p className="text-slate-400 mb-4">Add your first tenant to get started</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {tenants.map(({ tenant, unit, property }) => (
        <div
          key={tenant.id}
          className="rounded-lg border border-slate-700 bg-slate-800/50 p-6 hover:border-blue-500 transition"
        >
          <div className="mb-3">
            <h3 className="text-lg font-semibold">{tenant.name}</h3>
            <span
              className={`inline-block mt-1 rounded px-2 py-0.5 text-xs font-medium ${
                tenant.status === 'active'
                  ? 'bg-green-500/20 text-green-400'
                  : tenant.status === 'past'
                  ? 'bg-slate-500/20 text-slate-400'
                  : 'bg-yellow-500/20 text-yellow-400'
              }`}
            >
              {tenant.status || 'active'}
            </span>
          </div>

          {property && unit && (
            <p className="text-sm text-slate-400 mb-2">
              {property.name} - Unit {unit.unitNumber}
            </p>
          )}

          {tenant.email && (
            <p className="text-sm text-slate-300 mb-1">{tenant.email}</p>
          )}

          {tenant.phone && (
            <p className="text-sm text-slate-300 mb-1">{tenant.phone}</p>
          )}

          {tenant.leaseStart && tenant.leaseEnd && (
            <p className="text-xs text-slate-400 mt-2">
              Lease: {new Date(tenant.leaseStart).toLocaleDateString()} -{' '}
              {new Date(tenant.leaseEnd).toLocaleDateString()}
            </p>
          )}

          <div className="mt-4 flex gap-2">
            <button
              onClick={() => router.push(`/tenants/${tenant.id}`)}
              className="flex-1 rounded bg-blue-600 px-3 py-1.5 text-sm font-medium hover:bg-blue-700 transition"
            >
              View Details
            </button>
            <button
              onClick={() => handleDelete(tenant.id)}
              disabled={deleting === tenant.id}
              className="rounded bg-red-600 px-3 py-1.5 text-sm font-medium hover:bg-red-700 transition disabled:opacity-50"
            >
              {deleting === tenant.id ? '...' : 'Delete'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
