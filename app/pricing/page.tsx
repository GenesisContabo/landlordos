import { auth } from '@/lib/auth'
import { getUserSubscription } from '@/lib/subscription'
import PricingClient from './PricingClient'
import { createMetadata } from '@/lib/metadata'

export const metadata = createMetadata({
  title: 'Pricing Plans',
  description: 'Choose the perfect plan for your property management needs. Flexible pricing for landlords of all sizes.',
  path: '/pricing',
})

export default async function PricingPage() {
  const session = await auth()
  const userId = (session?.user as any)?.id

  let currentTier = 'free'
  if (userId) {
    const userSubscription = await getUserSubscription(userId)
    currentTier = userSubscription?.subscriptionTier?.toLowerCase() || 'free'
  }

  return <PricingClient currentTier={currentTier} />
}
