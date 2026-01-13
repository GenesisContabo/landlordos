interface SubscriptionBadgeProps {
  tier: string
  status?: string
}

export default function SubscriptionBadge({ tier, status }: SubscriptionBadgeProps) {
  const normalizedTier = tier?.toLowerCase() || 'free'

  const colors = {
    free: 'bg-gray-100 text-gray-800',
    starter: 'bg-blue-100 text-blue-800',
    pro: 'bg-purple-100 text-purple-800',
  }

  const labels = {
    free: 'Free',
    starter: 'Starter',
    pro: 'Pro',
  }

  const bgColor = colors[normalizedTier as keyof typeof colors] || colors.free
  const label = labels[normalizedTier as keyof typeof labels] || 'Free'

  // Show status indicator if subscription has issues
  const showWarning = status === 'past_due' || status === 'canceled'

  return (
    <div className="flex items-center gap-2">
      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${bgColor}`}>
        {label}
      </span>
      {showWarning && (
        <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">
          {status === 'past_due' ? 'Payment Due' : 'Canceled'}
        </span>
      )}
    </div>
  )
}
