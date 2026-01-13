'use client'

import { Check } from 'lucide-react'
import { useState } from 'react'

interface PricingCardProps {
  name: string
  price: number
  priceId: string | null
  features: readonly string[]
  isCurrentPlan?: boolean
  onUpgrade?: (priceId: string) => Promise<void>
}

export default function PricingCard({
  name,
  price,
  priceId,
  features,
  isCurrentPlan = false,
  onUpgrade,
}: PricingCardProps) {
  const [loading, setLoading] = useState(false)

  const handleUpgrade = async () => {
    if (!priceId || !onUpgrade) return

    setLoading(true)
    try {
      await onUpgrade(priceId)
    } catch (error) {
      console.error('Upgrade error:', error)
    } finally {
      setLoading(false)
    }
  }

  const isFree = price === 0
  const isPro = name === 'Pro'

  return (
    <div
      className={`rounded-lg border-2 p-6 ${
        isPro
          ? 'border-blue-500 bg-blue-50 shadow-lg'
          : 'border-gray-200 bg-white'
      }`}
    >
      <div className="mb-4">
        <h3 className="text-2xl font-bold text-gray-900">{name}</h3>
        {isPro && (
          <span className="mt-1 inline-block rounded-full bg-blue-500 px-3 py-1 text-xs font-semibold text-white">
            Popular
          </span>
        )}
      </div>

      <div className="mb-6">
        <span className="text-4xl font-bold text-gray-900">${price}</span>
        {!isFree && <span className="text-gray-600">/month</span>}
      </div>

      <ul className="mb-6 space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="mr-2 h-5 w-5 flex-shrink-0 text-green-500" />
            <span className="text-sm text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      {isCurrentPlan ? (
        <button
          disabled
          className="w-full rounded-lg bg-gray-300 px-4 py-3 font-semibold text-gray-600 cursor-not-allowed"
        >
          Current Plan
        </button>
      ) : isFree ? (
        <button
          disabled
          className="w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 font-semibold text-gray-700"
        >
          Free Forever
        </button>
      ) : (
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className={`w-full rounded-lg px-4 py-3 font-semibold text-white transition-colors ${
            isPro
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-800 hover:bg-gray-900'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Processing...' : `Upgrade to ${name}`}
        </button>
      )}
    </div>
  )
}
