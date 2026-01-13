'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Unit = {
  id: string
  propertyId: string
  unitNumber: string
  rentAmount: string
  status: string | null
  createdAt: Date | null
  updatedAt?: Date | null
}

export default function UnitsList({
  initialUnits,
  propertyId
}: {
  initialUnits: Unit[]
  propertyId: string
}) {
  const [units, setUnits] = useState(initialUnits)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [editData, setEditData] = useState<{ unitNumber: string; rentAmount: string; status: string }>({
    unitNumber: '',
    rentAmount: '',
    status: 'vacant'
  })
  const router = useRouter()

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this unit?')) {
      return
    }

    setDeleting(id)
    try {
      const res = await fetch(`/api/units/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')

      setUnits(units.filter(u => u.id !== id))
    } catch (error) {
      console.error(error)
      alert('Failed to delete unit')
    } finally {
      setDeleting(null)
    }
  }

  function startEdit(unit: Unit) {
    setEditing(unit.id)
    setEditData({
      unitNumber: unit.unitNumber,
      rentAmount: unit.rentAmount,
      status: unit.status || 'vacant'
    })
  }

  async function handleSave(id: string) {
    try {
      const res = await fetch(`/api/units/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      })

      if (!res.ok) throw new Error('Failed to update')

      setEditing(null)
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Failed to update unit')
    }
  }

  if (units.length === 0) {
    return (
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-8 text-center">
        <p className="text-slate-400">No units added yet. Create your first unit to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {units.map((unit) => (
        <div
          key={unit.id}
          className="rounded-lg border border-slate-700 bg-slate-800/50 p-4"
        >
          {editing === unit.id ? (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Unit Number</label>
                  <input
                    type="text"
                    value={editData.unitNumber}
                    onChange={(e) => setEditData({...editData, unitNumber: e.target.value})}
                    className="w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Rent Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editData.rentAmount}
                    onChange={(e) => setEditData({...editData, rentAmount: e.target.value})}
                    className="w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={editData.status}
                    onChange={(e) => setEditData({...editData, status: e.target.value})}
                    className="w-full rounded border border-slate-600 bg-slate-900 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="vacant">Vacant</option>
                    <option value="occupied">Occupied</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(null)}
                  className="flex-1 rounded border border-slate-600 px-3 py-1.5 text-sm font-medium hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSave(unit.id)}
                  className="flex-1 rounded bg-blue-600 px-3 py-1.5 text-sm font-medium hover:bg-blue-700 transition"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Unit {unit.unitNumber}</h3>
                <p className="text-sm text-slate-400">
                  ${parseFloat(unit.rentAmount).toFixed(2)}/month · {unit.status || 'vacant'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => startEdit(unit)}
                  className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium hover:bg-blue-700 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(unit.id)}
                  disabled={deleting === unit.id}
                  className="rounded bg-red-600 px-3 py-1.5 text-sm font-medium hover:bg-red-700 transition disabled:opacity-50"
                >
                  {deleting === unit.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
