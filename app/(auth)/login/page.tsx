import { Metadata } from 'next'
import LoginForm from '@/components/auth/LoginForm'
import Link from 'next/link'
import { createMetadata } from '@/lib/metadata'

export const metadata: Metadata = createMetadata({
  title: 'Sign In',
  description: 'Sign in to your LandlordOS account to manage your properties.',
  path: '/login',
  noIndex: true,
})

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="mt-2 text-slate-400">
            Log in to your account
          </p>
        </div>

        <div className="rounded-lg bg-slate-800/50 border border-slate-700 p-8">
          <LoginForm />
        </div>

        <p className="mt-4 text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
