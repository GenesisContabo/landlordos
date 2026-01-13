'use client'

import { useState } from 'react'
import { CreditCard } from 'lucide-react'

export default function BillingPortalButton() {
  const [loading, setLoading] = useState(false)

  const handleOpenPortal = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to create portal session')
      }

      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Portal error:', error)
      alert('Failed to open billing portal. Please try again.')
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleOpenPortal}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <CreditCard className="h-4 w-4" />
      {loading ? 'Loading...' : 'Manage Billing'}
    </button>
  )
}
