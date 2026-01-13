import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { updateUserSubscription } from '@/lib/subscription'
import { db } from '@/lib/db'
import { users, invoices } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Handle the event
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string
  const userId = subscription.metadata?.userId

  // Find user by customer ID or metadata
  let user
  if (userId) {
    user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    })
  } else {
    user = await db.query.users.findFirst({
      where: eq(users.stripeCustomerId, customerId),
    })
  }

  if (!user) {
    console.error('User not found for subscription:', subscription.id)
    return
  }

  // Determine tier from subscription items
  const priceId = subscription.items.data[0]?.price.id
  let tier = 'free'
  if (priceId === process.env.STRIPE_PRICE_STARTER) {
    tier = 'starter'
  } else if (priceId === process.env.STRIPE_PRICE_PRO) {
    tier = 'pro'
  }

  // Get current period end timestamp
  const periodEnd = (subscription as any).current_period_end
  const periodEndDate = periodEnd ? new Date(periodEnd * 1000) : null

  // Update user subscription
  await updateUserSubscription(user.id, {
    stripeCustomerId: customerId,
    subscriptionStatus: subscription.status,
    subscriptionTier: tier,
    subscriptionPeriodEnd: periodEndDate,
  })

  console.log(`Subscription updated for user ${user.id}: ${tier} (${subscription.status})`)
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string

  const user = await db.query.users.findFirst({
    where: eq(users.stripeCustomerId, customerId),
  })

  if (!user) {
    console.error('User not found for deleted subscription:', subscription.id)
    return
  }

  // Downgrade to free tier
  await updateUserSubscription(user.id, {
    subscriptionStatus: 'canceled',
    subscriptionTier: 'free',
    subscriptionPeriodEnd: null,
  })

  console.log(`Subscription canceled for user ${user.id}`)
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  const user = await db.query.users.findFirst({
    where: eq(users.stripeCustomerId, customerId),
  })

  if (!user) {
    console.error('User not found for invoice:', invoice.id)
    return
  }

  // Check if invoice already exists (idempotency)
  const existingInvoice = await db.query.invoices.findFirst({
    where: eq(invoices.stripeInvoiceId, invoice.id),
  })

  if (existingInvoice) {
    console.log('Invoice already recorded:', invoice.id)
    return
  }

  // Record successful payment
  await db.insert(invoices).values({
    userId: user.id,
    stripeInvoiceId: invoice.id,
    amount: (invoice.amount_paid / 100).toString(), // Convert cents to dollars
    status: invoice.status || 'paid',
    invoiceUrl: invoice.hosted_invoice_url || null,
  })

  console.log(`Invoice recorded for user ${user.id}: ${invoice.id}`)
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string

  const user = await db.query.users.findFirst({
    where: eq(users.stripeCustomerId, customerId),
  })

  if (!user) {
    console.error('User not found for failed invoice:', invoice.id)
    return
  }

  // Update subscription status to past_due
  await updateUserSubscription(user.id, {
    subscriptionStatus: 'past_due',
  })

  console.log(`Payment failed for user ${user.id}, status set to past_due`)
}
