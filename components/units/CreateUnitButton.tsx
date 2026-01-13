'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateUnitButton({ propertyId }: { propertyId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [unitNumber, setUnitNumber] = useState('')
  const [rentAmount, setRentAmount] = useState('')
  const [status, setStatus] = useState('vacant')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!unitNumber.trim() || !rentAmount) return

    setLoading(true)
    try {
      const res = await fetch('/api/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId, unitNumber, rentAmount: parseFloat(rentAmount), status }),
      })

      if (!res.ok) throw new Error('Failed to create')

      setIsOpen(false)
      setUnitNumber('')
      setRentAmount('')
      setStatus('vacant')
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Failed to create unit')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded bg-blue-600 px-3 py-1.5 text-sm font-medium hover:bg-blue-700 transition"
      >
        + Add Unit
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-lg bg-slate-800 border border-slate-700 p-6">
            <h2 className="text-xl font-bold mb-4">Add New Unit</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Unit Number *</label>
                <input
                  type="text"
                  value={unitNumber}
                  onChange={(e) => setUnitNumber(e.target.value)}
                  required
                  className="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="101, A1, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Monthly Rent *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={rentAmount}
                  onChange={(e) => setRentAmount(e.target.value)}
                  required
                  className="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1200.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="vacant">Vacant</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 rounded border border-slate-600 px-4 py-2 font-medium hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !unitNumber.trim() || !rentAmount}
                  className="flex-1 rounded bg-blue-600 px-4 py-2 font-medium hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
