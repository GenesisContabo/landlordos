import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { stripe, PRICING, PricingTier } from '@/lib/stripe'

export interface UserSubscription {
  id: string
  email: string
  stripeCustomerId: string | null
  subscriptionStatus: string | null
  subscriptionTier: string | null
  subscriptionPeriodEnd: Date | null
}

/**
 * Get user's subscription details
 */
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: {
      id: true,
      email: true,
      stripeCustomerId: true,
      subscriptionStatus: true,
      subscriptionTier: true,
      subscriptionPeriodEnd: true,
    },
  })

  return user || null
}

/**
 * Update user's subscription information
 */
export async function updateUserSubscription(
  userId: string,
  data: {
    stripeCustomerId?: string
    subscriptionStatus?: string
    subscriptionTier?: string
    subscriptionPeriodEnd?: Date | null
  }
) {
  await db
    .update(users)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
}

/**
 * Create or retrieve Stripe customer for a user
 */
export async function getOrCreateStripeCustomer(userId: string, email: string): Promise<string> {
  const user = await getUserSubscription(userId)

  // Return existing customer ID if available
  if (user?.stripeCustomerId) {
    return user.stripeCustomerId
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({
    email,
    metadata: {
      userId,
    },
  })

  // Save customer ID to database
  await updateUserSubscription(userId, {
    stripeCustomerId: customer.id,
  })

  return customer.id
}

/**
 * Check if user can perform action based on their subscription tier
 */
export async function checkSubscriptionLimit(
  userId: string,
  limitType: 'properties' | 'storage'
): Promise<{ allowed: boolean; current: number; limit: number; tier: string }> {
  const user = await getUserSubscription(userId)
  const tier = (user?.subscriptionTier || 'free').toUpperCase() as PricingTier
  const limits = PRICING[tier]?.limits || PRICING.FREE.limits

  let current = 0

  if (limitType === 'properties') {
    // Count user's properties
    const { properties } = await import('@/lib/schema')
    const { count } = await import('drizzle-orm')
    const result = await db
      .select({ count: count() })
      .from(properties)
      .where(eq(properties.userId, userId))
    current = result[0]?.count || 0
  }

  const limit = limits[limitType]
  const allowed = current < limit

  return {
    allowed,
    current,
    limit,
    tier: tier.toLowerCase(),
  }
}

/**
 * Get user's current pricing tier details
 */
export function getPricingTier(tier: string | null | undefined): typeof PRICING[PricingTier] {
  const normalizedTier = (tier || 'free').toUpperCase() as PricingTier
  return PRICING[normalizedTier] || PRICING.FREE
}
