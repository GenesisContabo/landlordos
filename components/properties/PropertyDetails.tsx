'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Property = {
  id: string
  name: string
  address: string | null
  notes: string | null
  createdAt: Date | null
  updatedAt?: Date | null
}

export default function PropertyDetails({ property }: { property: Property }) {
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(property.name)
  const [address, setAddress] = useState(property.address || '')
  const [notes, setNotes] = useState(property.notes || '')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSave() {
    if (!name.trim()) return

    setLoading(true)
    try {
      const res = await fetch(`/api/properties/${property.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, address, notes }),
      })

      if (!res.ok) throw new Error('Failed to update')

      setIsEditing(false)
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Failed to update property')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-6">
      <div className="mb-4 flex items-center justify-between">
        <Link href="/properties" className="text-blue-500 hover:text-blue-400">
          ← Back to Properties
        </Link>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium hover:bg-blue-700 transition"
          >
            Edit
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Property Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setName(property.name)
                setAddress(property.address || '')
                setNotes(property.notes || '')
                setIsEditing(false)
              }}
              className="flex-1 rounded border border-slate-600 px-4 py-2 font-medium hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading || !name.trim()}
              className="flex-1 rounded bg-blue-600 px-4 py-2 font-medium hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      ) : (
        <div>
          <h1 className="text-2xl font-bold mb-2">{property.name}</h1>
          {property.address && (
            <p className="text-slate-400 mb-3">{property.address}</p>
          )}
          {property.notes && (
            <div className="mt-4">
              <h3 className="text-sm font-semibold text-slate-400 mb-1">Notes</h3>
              <p className="text-slate-300 whitespace-pre-wrap">{property.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
