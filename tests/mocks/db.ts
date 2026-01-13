import { vi } from 'vitest'

// Mock database with in-memory storage for testing
const mockDb = new Map<string, any>()

// Mock user data
export const mockUsers = new Map<string, any>()

// Mock property data
export const mockProperties = new Map<string, any>()

// Mock units data
export const mockUnits = new Map<string, any>()

// Mock tenants data
export const mockTenants = new Map<string, any>()

// Mock payments data
export const mockPayments = new Map<string, any>()

// Mock maintenance requests data
export const mockMaintenanceRequests = new Map<string, any>()

// Helper to generate UUID
export const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Clear all mock data
export const clearMockData = () => {
  mockUsers.clear()
  mockProperties.clear()
  mockUnits.clear()
  mockTenants.clear()
  mockPayments.clear()
  mockMaintenanceRequests.clear()
}

export { mockDb }
