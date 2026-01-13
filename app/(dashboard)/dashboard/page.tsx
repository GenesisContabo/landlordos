import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const session = await auth()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-slate-400">
          Welcome back, {session.user?.name}
        </p>
      </div>

      <div className="rounded-lg bg-slate-800/50 border border-slate-700 p-8 text-center">
        <h2 className="text-lg font-semibold mb-2">Dashboard Coming Soon</h2>
        <p className="text-slate-400">
          Full dashboard with properties, tenants, and payments will be available after Chunk 3 is complete.
        </p>
        <p className="mt-4 text-sm text-slate-500">
          Current Plan: <span className="capitalize">{(session.user as any).subscriptionTier || 'free'}</span>
        </p>
      </div>
    </div>
  )
}
