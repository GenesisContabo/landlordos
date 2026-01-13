'use client'

import Link from 'next/link'
import { Moon, Sun, Home, Building2, Users, DollarSign, Wrench, LogOut } from 'lucide-react'
import { useTheme } from './ThemeProvider'

type MobileNavProps = {
  onClose: () => void
  isLoggedIn?: boolean
  onLogout?: () => void
}

export default function MobileNav({ onClose, isLoggedIn, onLogout }: MobileNavProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="md:hidden border-t border-slate-700 bg-background">
      <div className="container mx-auto px-4 py-4 space-y-4">
        {isLoggedIn ? (
          <>
            <Link href="/dashboard" className="flex items-center gap-2 py-2 text-foreground hover:text-primary" onClick={onClose}>
              <Home className="h-4 w-4" />
              Dashboard
            </Link>
            <Link href="/properties" className="flex items-center gap-2 py-2 text-foreground hover:text-primary" onClick={onClose}>
              <Building2 className="h-4 w-4" />
              Properties
            </Link>
            <Link href="/tenants" className="flex items-center gap-2 py-2 text-foreground hover:text-primary" onClick={onClose}>
              <Users className="h-4 w-4" />
              Tenants
            </Link>
            <Link href="/payments" className="flex items-center gap-2 py-2 text-foreground hover:text-primary" onClick={onClose}>
              <DollarSign className="h-4 w-4" />
              Payments
            </Link>
            <Link href="/maintenance" className="flex items-center gap-2 py-2 text-foreground hover:text-primary" onClick={onClose}>
              <Wrench className="h-4 w-4" />
              Maintenance
            </Link>
            {onLogout && (
              <button onClick={onLogout} className="flex items-center gap-2 py-2 text-foreground hover:text-red-500 w-full">
                <LogOut className="h-4 w-4" />
                Log Out
              </button>
            )}
          </>
        ) : (
          <>
            <Link href="/features" className="block py-2 text-foreground hover:text-primary" onClick={onClose}>Features</Link>
            <Link href="/pricing" className="block py-2 text-foreground hover:text-primary" onClick={onClose}>Pricing</Link>
            <Link href="/login" className="block py-2 text-foreground hover:text-primary" onClick={onClose}>Log In</Link>
            <Link href="/signup" className="block py-2 px-4 bg-accent text-white rounded-md text-center" onClick={onClose}>Get Started Free</Link>
          </>
        )}

        <button onClick={() => { toggleTheme(); onClose(); }} className="flex items-center gap-2 py-2">
          {theme === 'dark' ? (<><Sun className="h-5 w-5" /><span>Light Mode</span></>) : (<><Moon className="h-5 w-5" /><span>Dark Mode</span></>)}
        </button>
      </div>
    </div>
  )
}
