import { test, expect } from '@playwright/test'

const LIVE_URL = 'https://landlordos.vercel.app'

test('Debug CSRF token flow', async ({ page }) => {
  // Enable console logging
  page.on('console', (msg) => console.log('Browser console:', msg.text()))

  // Navigate to signup
  await page.goto(`${LIVE_URL}/signup`)

  // Check cookies after page load
  const cookies = await page.context().cookies()
  console.log('\n📋 Cookies after page load:')
  cookies.forEach((c) => {
    if (c.name.includes('csrf')) {
      console.log(`  - ${c.name}: ${c.value.substring(0, 20)}... (httpOnly: ${c.httpOnly})`)
    }
  })

  // Check if csrf-secret cookie exists and can be read by JS
  const csrfSecretValue = await page.evaluate(() => {
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=')
      if (name === 'csrf-secret') {
        return value
      }
    }
    return null
  })

  console.log('\n🔍 csrf-secret readable by JS:', csrfSecretValue ? 'YES' : 'NO')
  if (csrfSecretValue) {
    console.log(`   Value: ${csrfSecretValue.substring(0, 20)}...`)
  }

  // Fill form and intercept request to see headers
  await page.fill('input[name="name"]', 'Debug Test')
  await page.fill('input[name="email"]', `debug-${Date.now()}@test.com`)
  await page.fill('input[name="password"]', 'TestPass123!')

  // Intercept the signup request to see what headers are sent
  page.on('request', (request) => {
    if (request.url().includes('/api/auth/signup')) {
      console.log('\n📤 Signup request headers:')
      const headers = request.headers()
      console.log(`  - x-csrf-token: ${headers['x-csrf-token'] || 'MISSING!'}`)
      console.log(`  - content-type: ${headers['content-type']}`)
    }
  })

  // Submit
  await page.click('button[type="submit"]')

  // Wait for response
  await page.waitForTimeout(2000)

  console.log('\n✅ Debug complete')
})
