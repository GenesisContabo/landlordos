import { test, expect } from '@playwright/test'

const LIVE_URL = 'https://landlordos.vercel.app'

test.describe('Authentication Flow - CSRF Fixed', () => {
  test('should have CSRF token cookie on page load', async ({ page }) => {
    await page.goto(`${LIVE_URL}/signup`)

    // Check for CSRF token cookies
    const cookies = await page.context().cookies()
    const csrfSecret = cookies.find(c => c.name === 'csrf-secret')
    const csrfToken = cookies.find(c => c.name === 'csrf-token')

    expect(csrfSecret).toBeDefined()
    expect(csrfToken).toBeDefined()

    console.log('✓ CSRF tokens present:', {
      'csrf-secret': csrfSecret?.value.substring(0, 10) + '...',
      'csrf-token': csrfToken?.value.substring(0, 10) + '...',
    })
  })

  test('should signup successfully with CSRF token', async ({ page }) => {
    const timestamp = Date.now()
    const testEmail = `test-${timestamp}@landlordos-test.com`
    const testPassword = 'TestPass123!'
    const testName = 'Test User'

    await page.goto(`${LIVE_URL}/signup`)

    // Fill signup form
    await page.fill('input[name="name"]', testName)
    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="password"]', testPassword)

    // Listen for network request
    const responsePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/api/auth/signup') && response.request().method() === 'POST'
    )

    // Submit form
    await page.click('button[type="submit"]')

    // Wait for response
    const response = await responsePromise

    // Check response status
    const status = response.status()
    console.log('Signup response status:', status)

    // Get response body
    const body = await response.json()
    console.log('Signup response body:', body)

    // Verify success
    expect(status).toBe(201)
    expect(body.user).toBeDefined()
    expect(body.user.email).toBe(testEmail)

    // Should redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 })
    expect(page.url()).toContain('/dashboard')

    console.log('✓ Signup successful! User created:', body.user)
  })

  test('should login successfully after signup', async ({ page }) => {
    // First create an account
    const timestamp = Date.now()
    const testEmail = `test-login-${timestamp}@landlordos-test.com`
    const testPassword = 'TestPass123!'

    // Signup
    await page.goto(`${LIVE_URL}/signup`)
    await page.fill('input[name="name"]', 'Test Login User')
    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="password"]', testPassword)
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard', { timeout: 10000 })

    // Logout (clear session)
    await page.context().clearCookies()

    // Now login
    await page.goto(`${LIVE_URL}/login`)
    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="password"]', testPassword)

    // Submit login
    await page.click('button[type="submit"]')

    // Should redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 })
    expect(page.url()).toContain('/dashboard')

    console.log('✓ Login successful!')
  })

  test('should persist session after page reload', async ({ page }) => {
    // Create account and login
    const timestamp = Date.now()
    const testEmail = `test-session-${timestamp}@landlordos-test.com`
    const testPassword = 'TestPass123!'

    await page.goto(`${LIVE_URL}/signup`)
    await page.fill('input[name="name"]', 'Test Session User')
    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="password"]', testPassword)
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard', { timeout: 10000 })

    // Reload page
    await page.reload()

    // Should still be on dashboard
    expect(page.url()).toContain('/dashboard')

    // Dashboard content should be visible
    await expect(page.locator('h1, h2').filter({ hasText: /dashboard|properties|overview/i })).toBeVisible()

    console.log('✓ Session persisted after reload!')
  })

  test('should reject signup with invalid CSRF token (security test)', async ({ page, context }) => {
    const timestamp = Date.now()
    const testEmail = `test-invalid-${timestamp}@landlordos-test.com`

    await page.goto(`${LIVE_URL}/signup`)

    // Intercept the request and modify CSRF token
    await page.route('**/api/auth/signup', async (route) => {
      const headers = await route.request().headers()

      // Corrupt the CSRF token
      headers['x-csrf-token'] = 'invalid-token-should-fail'

      await route.continue({ headers })
    })

    // Try to signup
    await page.fill('input[name="name"]', 'Invalid CSRF User')
    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="password"]', 'TestPass123!')

    const responsePromise = page.waitForResponse(
      (response) => response.url().includes('/api/auth/signup')
    )

    await page.click('button[type="submit"]')

    const response = await responsePromise
    const status = response.status()
    const body = await response.json()

    // Should be rejected with 403
    expect(status).toBe(403)
    expect(body.error).toContain('CSRF')

    console.log('✓ Invalid CSRF token correctly rejected!')
  })

  test('should handle duplicate email gracefully', async ({ page }) => {
    const testEmail = 'duplicate@landlordos-test.com'
    const testPassword = 'TestPass123!'

    // Create first account
    await page.goto(`${LIVE_URL}/signup`)
    await page.fill('input[name="name"]', 'First User')
    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="password"]', testPassword)
    await page.click('button[type="submit"]')

    try {
      await page.waitForURL('**/dashboard', { timeout: 10000 })
    } catch {
      // Account might already exist from previous test
      console.log('First signup might have failed (account exists)')
    }

    // Clear session
    await page.context().clearCookies()

    // Try to create duplicate
    await page.goto(`${LIVE_URL}/signup`)
    await page.fill('input[name="name"]', 'Second User')
    await page.fill('input[name="email"]', testEmail)
    await page.fill('input[name="password"]', testPassword)

    const responsePromise = page.waitForResponse(
      (response) => response.url().includes('/api/auth/signup')
    )

    await page.click('button[type="submit"]')

    const response = await responsePromise
    const status = response.status()
    const body = await response.json()

    // Should be rejected with 409
    expect(status).toBe(409)
    expect(body.error).toContain('already exists')

    console.log('✓ Duplicate email correctly rejected!')
  })
})
