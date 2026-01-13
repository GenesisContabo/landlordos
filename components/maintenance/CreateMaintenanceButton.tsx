'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type UnitOption = {
  unit: { id: string; unitNumber: string }
  property: { name: string }
}

export default function CreateMaintenanceButton({ units }: { units: UnitOption[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [unitId, setUnitId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!unitId || !title.trim() || !description.trim()) return

    setLoading(true)
    try {
      const res = await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ unitId, title, description, priority }),
      })
      if (!res.ok) throw new Error('Failed to create')

      setIsOpen(false)
      setUnitId('')
      setTitle('')
      setDescription('')
      setPriority('medium')
      router.refresh()
    } catch (error) {
      alert('Failed to create maintenance request')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded bg-orange-600 px-4 py-2 font-medium hover:bg-orange-700 transition"
      >
        + New Request
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-lg bg-slate-800 border border-slate-700 p-6">
            <h2 className="text-xl font-bold mb-4">Create Maintenance Request</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Unit *</label>
                <select value={unitId} onChange={(e) => setUnitId(e.target.value)} required
                  className="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select unit...</option>
                  {units.map(({ unit, property }) => (
                    <option key={unit.id} value={unit.id}>{property.name} - Unit {unit.unitNumber}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required
                  className="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Leaking faucet, broken AC, etc." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={3}
                  className="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Detailed description..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)}
                  className="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setIsOpen(false)}
                  className="flex-1 rounded border border-slate-600 px-4 py-2 font-medium hover:bg-slate-700 transition">Cancel</button>
                <button type="submit" disabled={loading || !unitId || !title.trim() || !description.trim()}
                  className="flex-1 rounded bg-orange-600 px-4 py-2 font-medium hover:bg-orange-700 transition disabled:opacity-50">
                  {loading ? 'Creating...' : 'Create Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
