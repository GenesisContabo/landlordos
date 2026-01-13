import { beforeAll, afterAll, afterEach } from 'vitest'

// Mock environment variables for testing
beforeAll(() => {
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://mock:mock@localhost:5432/landlordos_test'
  process.env.NEXTAUTH_SECRET = 'test-secret-key-for-testing-only'
  process.env.NEXTAUTH_URL = 'http://localhost:3000'
  process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key'
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mock_secret'
  process.env.RESEND_API_KEY = 'mock_resend_key'
})

// Clean up after tests
afterEach(() => {
  // Reset any module mocks if needed
})

afterAll(() => {
  // Cleanup
})
