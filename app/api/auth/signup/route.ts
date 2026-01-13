import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users } from '@/lib/schema'
import { hashPassword, validatePassword } from '@/lib/password'
import { sendWelcomeEmail } from '@/lib/email'
import { eq } from 'drizzle-orm'
import { signIn } from '@/lib/auth'
import { getAuthRateLimit, getIdentifier } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 attempts per 15 minutes per IP
    const identifier = getIdentifier(request)
    const rateLimitResult = getAuthRateLimit(identifier)

    if (!rateLimitResult.success) {
      const resetTime = new Date(rateLimitResult.reset).toLocaleTimeString()
      return NextResponse.json(
        {
          error: 'Too many signup attempts. Please try again later.',
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000)
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          }
        }
      )
    }

    const body = await request.json()
    const { name, email, password } = body

    // Validate
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate password
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        {
          error: 'Invalid password',
          fields: { password: passwordValidation.errors[0] },
        },
        { status: 400 }
      )
    }

    // Check if email exists
    const existing = await db.query.users.findFirst({
      where: eq(users.email, email),
    })

    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash,
        subscriptionTier: 'free',
        subscriptionStatus: 'free',
      })
      .returning()

    // Send welcome email (don't await - send in background)
    sendWelcomeEmail(email, name).catch(console.error)

    // Create session
    await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    return NextResponse.json(
      {
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
