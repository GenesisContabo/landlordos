import Stripe from 'stripe'

// Allow build to proceed without Stripe keys (build time vs runtime)
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder'

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-12-15.clover',
  typescript: true,
})

// Pricing configuration
export const PRICING = {
  FREE: {
    name: 'Free',
    price: 0,
    priceId: null,
    features: [
      'Up to 2 properties',
      'Unlimited tenants',
      'Basic rent tracking',
      'Community support',
    ],
    limits: {
      properties: 2,
      storage: 0,
    },
  },
  STARTER: {
    name: 'Starter',
    price: 15,
    priceId: process.env.STRIPE_PRICE_STARTER || '',
    features: [
      'Up to 10 properties',
      'Unlimited tenants',
      'Rent tracking',
      'Maintenance requests',
      '100MB document storage',
      'Email support',
    ],
    limits: {
      properties: 10,
      storage: 100 * 1024 * 1024, // 100MB in bytes
    },
  },
  PRO: {
    name: 'Pro',
    price: 35,
    priceId: process.env.STRIPE_PRICE_PRO || '',
    features: [
      'Unlimited properties',
      'Unlimited tenants',
      'Full rent tracking',
      'Priority maintenance',
      '5GB document storage',
      'Priority support',
      'Advanced analytics',
    ],
    limits: {
      properties: Infinity,
      storage: 5 * 1024 * 1024 * 1024, // 5GB in bytes
    },
  },
} as const

export type PricingTier = keyof typeof PRICING
