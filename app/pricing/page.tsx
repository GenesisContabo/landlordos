import { auth } from '@/lib/auth'
import { getUserSubscription } from '@/lib/subscription'
import PricingClient from './PricingClient'

export const metadata = {
  title: 'Pricing - LandlordOS',
  description: 'Choose the perfect plan for your property management needs',
}

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
