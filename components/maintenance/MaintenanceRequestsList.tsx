'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type RequestWithContext = {
  request: {
    id: string
    title: string
    description: string
    status: string | null
    priority: string | null
    createdAt: Date | null
    resolvedAt: Date | null
  }
  unit: { unitNumber: string }
  property: { name: string }
}

export default function MaintenanceRequestsList({ initialRequests }: { initialRequests: RequestWithContext[] }) {
  const [requests, setRequests] = useState(initialRequests)
  const [updating, setUpdating] = useState<string | null>(null)
  const router = useRouter()

  async function handleStatusChange(id: string, newStatus: string) {
    setUpdating(id)
    try {
      const res = await fetch(`/api/maintenance/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error('Failed to update')
      router.refresh()
    } catch (error) {
      alert('Failed to update status')
    } finally {
      setUpdating(null)
    }
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-12 text-center">
        <h3 className="text-lg font-semibold mb-2">No maintenance requests</h3>
        <p className="text-slate-400">Create your first maintenance request</p>
      </div>
    )
  }

  const openRequests = requests.filter(r => r.request.status === 'open')
  const resolvedRequests = requests.filter(r => r.request.status === 'resolved')

  return (
    <div className="space-y-6">
      {openRequests.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Open Requests ({openRequests.length})</h2>
          <div className="space-y-3">
            {openRequests.map(({ request, unit, property }) => (
              <div key={request.id} className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold">{request.title}</h3>
                    <p className="text-sm text-slate-400">{property.name} - Unit {unit.unitNumber}</p>
                  </div>
                  <span className={`rounded px-2 py-1 text-xs font-medium ${
                    request.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                    request.priority === 'low' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {request.priority || 'medium'}
                  </span>
                </div>
                <p className="text-sm text-slate-300 mb-3">{request.description}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleStatusChange(request.id, 'in_progress')}
                    disabled={updating === request.id}
                    className="rounded bg-yellow-600 px-3 py-1.5 text-sm font-medium hover:bg-yellow-700 transition disabled:opacity-50"
                  >
                    Mark In Progress
                  </button>
                  <button
                    onClick={() => handleStatusChange(request.id, 'resolved')}
                    disabled={updating === request.id}
                    className="rounded bg-green-600 px-3 py-1.5 text-sm font-medium hover:bg-green-700 transition disabled:opacity-50"
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {resolvedRequests.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Resolved ({resolvedRequests.length})</h2>
          <div className="space-y-2">
            {resolvedRequests.map(({ request, unit, property }) => (
              <div key={request.id} className="rounded-lg border border-slate-700 bg-slate-800/30 p-3 opacity-60">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-sm">{request.title}</h3>
                    <p className="text-xs text-slate-400">{property.name} - Unit {unit.unitNumber}</p>
                  </div>
                  <span className="text-xs text-green-400">✓ Resolved</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
