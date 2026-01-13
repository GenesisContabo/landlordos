'use client'

import { useState } from 'react'
import { PRICING } from '@/lib/stripe'
import PricingCard from '@/components/PricingCard'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { showError, showLoading, dismissToast } from '@/lib/toast'

interface PricingClientProps {
  currentTier: string
}

export default function PricingClient({ currentTier }: PricingClientProps) {
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null)

  const handleUpgrade = async (priceId: string) => {
    setLoadingPriceId(priceId)
    const toastId = showLoading('Processing...')

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await response.json()
      dismissToast(toastId)
      window.location.href = url
    } catch (error) {
      dismissToast(toastId)
      showError('Failed to start checkout. Please try again.')
      setLoadingPriceId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-gray-600">
            Select the perfect plan for your property management needs
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          <PricingCard
            name={PRICING.FREE.name}
            price={PRICING.FREE.price}
            priceId={PRICING.FREE.priceId}
            features={PRICING.FREE.features}
            isCurrentPlan={currentTier === 'free'}
          />

          <PricingCard
            name={PRICING.STARTER.name}
            price={PRICING.STARTER.price}
            priceId={PRICING.STARTER.priceId}
            features={PRICING.STARTER.features}
            isCurrentPlan={currentTier === 'starter'}
            onUpgrade={handleUpgrade}
          />

          <PricingCard
            name={PRICING.PRO.name}
            price={PRICING.PRO.price}
            priceId={PRICING.PRO.priceId}
            features={PRICING.PRO.features}
            isCurrentPlan={currentTier === 'pro'}
            onUpgrade={handleUpgrade}
          />
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I change plans later?
              </h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time from your dashboard.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-600">
                We accept all major credit cards through Stripe's secure payment processing.
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-600">
                The Free plan is available forever with no credit card required. Try it out!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
