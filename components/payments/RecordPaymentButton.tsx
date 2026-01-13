'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type TenantOption = {
  tenant: {
    id: string
    name: string
  }
  unit: {
    unitNumber: string
  } | null
  property: {
    name: string
  } | null
}

export default function RecordPaymentButton({ tenants }: { tenants: TenantOption[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [tenantId, setTenantId] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [paymentMethod, setPaymentMethod] = useState('check')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!tenantId || !amount || !paymentDate) return

    setLoading(true)
    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          amount: parseFloat(amount),
          paymentDate,
          paymentMethod,
          notes,
        }),
      })

      if (!res.ok) throw new Error('Failed to record payment')

      setIsOpen(false)
      resetForm()
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Failed to record payment')
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    setTenantId('')
    setAmount('')
    setPaymentDate(new Date().toISOString().split('T')[0])
    setPaymentMethod('check')
    setNotes('')
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="rounded bg-green-600 px-4 py-2 font-medium hover:bg-green-700 transition"
      >
        + Record Payment
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-lg bg-slate-800 border border-slate-700 p-6">
            <h2 className="text-xl font-bold mb-4">Record Payment</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tenant *</label>
                <select
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  required
                  className="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select tenant...</option>
                  {tenants.map(({ tenant, unit, property }) => (
                    <option key={tenant.id} value={tenant.id}>
                      {tenant.name}
                      {property && unit && ` - ${property.name} Unit ${unit.unitNumber}`}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="1200.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Payment Date *</label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                  className="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="check">Check</option>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="online">Online Payment</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full rounded border border-slate-600 bg-slate-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Optional notes..."
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false)
                    resetForm()
                  }}
                  className="flex-1 rounded border border-slate-600 px-4 py-2 font-medium hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !tenantId || !amount || !paymentDate}
                  className="flex-1 rounded bg-green-600 px-4 py-2 font-medium hover:bg-green-700 transition disabled:opacity-50"
                >
                  {loading ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
