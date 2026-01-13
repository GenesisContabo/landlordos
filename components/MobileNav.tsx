'use client'

import Link from 'next/link'
import { useTheme } from './ThemeProvider'
import { Moon, Sun } from 'lucide-react'

interface MobileNavProps {
  onClose: () => void
}

export default function MobileNav({ onClose }: MobileNavProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="border-t border-slate-700 bg-background px-4 py-6 md:hidden">
      <div className="flex flex-col gap-4">
        <Link
          href="/features"
          className="text-foreground hover:text-primary"
          onClick={onClose}
        >
          Features
        </Link>
        <Link
          href="/pricing"
          className="text-foreground hover:text-primary"
          onClick={onClose}
        >
          Pricing
        </Link>
        <Link
          href="/login"
          className="text-foreground hover:text-primary"
          onClick={onClose}
        >
          Log In
        </Link>
        <Link
          href="/signup"
          className="px-4 py-2 bg-accent text-white rounded-md text-center"
          onClick={onClose}
        >
          Get Started Free
        </Link>

        <button
          onClick={() => {
            toggleTheme()
            onClose()
          }}
          className="flex items-center gap-2 rounded-md p-2 hover:bg-slate-800"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="h-5 w-5" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="h-5 w-5" />
              <span>Dark Mode</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
