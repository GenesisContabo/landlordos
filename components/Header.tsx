'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X, Moon, Sun, Home, Building2, Users, DollarSign, Wrench, LogOut } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import MobileNav from './MobileNav'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()

  useEffect(() => {
    setIsLoggedIn(pathname?.startsWith('/dashboard') || pathname?.startsWith('/properties') || pathname?.startsWith('/tenants') || pathname?.startsWith('/payments') || pathname?.startsWith('/maintenance'))
  }, [pathname])

  async function handleLogout() {
    await fetch('/api/auth/signout', { method: 'POST' })
    window.location.href = '/login'
  }

  return (
    <header className="border-b border-slate-700 bg-background">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href={isLoggedIn ? "/dashboard" : "/"} className="text-2xl font-bold text-primary">
          LandlordOS
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-6">
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className="flex items-center gap-2 text-foreground hover:text-primary">
                <Home className="h-4 w-4" />
                Dashboard
              </Link>
              <Link href="/properties" className="flex items-center gap-2 text-foreground hover:text-primary">
                <Building2 className="h-4 w-4" />
                Properties
              </Link>
              <Link href="/tenants" className="flex items-center gap-2 text-foreground hover:text-primary">
                <Users className="h-4 w-4" />
                Tenants
              </Link>
              <Link href="/payments" className="flex items-center gap-2 text-foreground hover:text-primary">
                <DollarSign className="h-4 w-4" />
                Payments
              </Link>
              <Link href="/maintenance" className="flex items-center gap-2 text-foreground hover:text-primary">
                <Wrench className="h-4 w-4" />
                Maintenance
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-foreground hover:text-red-500"
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link href="/features" className="text-foreground hover:text-primary">
                Features
              </Link>
              <Link href="/pricing" className="text-foreground hover:text-primary">
                Pricing
              </Link>
              <Link href="/login" className="text-foreground hover:text-primary">
                Log In
              </Link>
              <Link href="/signup" className="px-4 py-2 bg-accent text-white rounded-md hover:bg-opacity-90">
                Get Started Free
              </Link>
            </>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="rounded-md p-2 hover:bg-slate-800"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && <MobileNav onClose={() => setMobileMenuOpen(false)} isLoggedIn={isLoggedIn} onLogout={handleLogout} />}
    </header>
  )
}
