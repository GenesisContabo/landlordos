import { Metadata } from 'next'
import SignupForm from '@/components/auth/SignupForm'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Sign Up - LandlordOS',
  robots: { index: false, follow: false },
}

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Create your account</h1>
          <p className="mt-2 text-slate-400">
            Get started with your free account
          </p>
        </div>

        <div className="rounded-lg bg-slate-800/50 border border-slate-700 p-8">
          <SignupForm />
        </div>

        <p className="mt-4 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
