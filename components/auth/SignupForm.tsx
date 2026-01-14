'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { showSuccess, showError } from '@/lib/toast'
import { getCsrfHeaders } from '@/lib/csrf-client'

function validatePassword(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  if (password.length < 8) errors.push('Password must be at least 8 characters')
  if (!/[A-Z]/.test(password)) errors.push('Password must contain uppercase letter')
  if (!/[a-z]/.test(password)) errors.push('Password must contain lowercase letter')
  if (!/[0-9]/.test(password)) errors.push('Password must contain number')
  return { valid: errors.length === 0, errors }
}

export default function SignupForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setFieldErrors({})

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    // Client-side validation
    const errors: Record<string, string> = {}

    if (!name || name.length < 2) {
      errors.name = 'Name must be at least 2 characters'
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Invalid email address'
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      errors.password = passwordValidation.errors[0]
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      setLoading(false)
      return
    }

    try {
      const headers = getCsrfHeaders()
      console.log('CSRF headers being sent:', headers)

      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers,
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.fields) {
          setFieldErrors(data.fields)
        } else {
          showError(data.error || 'Signup failed')
          setError(data.error || 'Signup failed')
        }
        setLoading(false)
        return
      }

      // Success - redirect to dashboard
      showSuccess('Account created successfully!')
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      showError('An unexpected error occurred')
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-500/10 p-3 text-sm text-red-500">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Full Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 focus:border-blue-500 focus:outline-none"
          placeholder="John Doe"
          required
        />
        {fieldErrors.name && (
          <p className="mt-1 text-sm text-red-500">{fieldErrors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-1">
          Email Address
        </label>
        <input
          type="email"
          id="email"
          name="email"
          className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 focus:border-blue-500 focus:outline-none"
          placeholder="you@example.com"
          required
        />
        {fieldErrors.email && (
          <p className="mt-1 text-sm text-red-500">{fieldErrors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1">
          Password
        </label>
        <input
          type="password"
          id="password"
          name="password"
          className="w-full rounded-md bg-slate-900 border border-slate-700 px-3 py-2 focus:border-blue-500 focus:outline-none"
          placeholder="••••••••"
          required
        />
        {fieldErrors.password && (
          <p className="mt-1 text-sm text-red-500">{fieldErrors.password}</p>
        )}
        <p className="mt-1 text-xs text-slate-400">
          At least 8 characters with uppercase, lowercase, and number
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-accent text-white rounded-md hover:bg-opacity-90 disabled:opacity-50"
      >
        {loading ? 'Creating account...' : 'Create Account'}
      </button>
    </form>
  )
}
