'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, LogOut, BarChart3, Wallet, Target, Users } from 'lucide-react'
import { signOut } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'

interface NavigationProps {
  user: {
    id: string
    name?: string
    email: string
  }
}

export function Navigation({ user }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleLogout = async () => {
    await signOut()
    router.push('/sign-in')
    router.refresh()
  }

  const links = [
    { href: '/', label: 'Dashboard', icon: BarChart3 },
    { href: '/transactions', label: 'Transactions', icon: Wallet },
    { href: '/budgets', label: 'Budgets', icon: Target },
    { href: '/family', label: 'Family', icon: Users },
  ]

  return (
    <nav className="bg-card border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Wallet className="w-6 h-6 text-accent" />
            <span className="text-xl font-bold text-foreground">FinanceHub</span>
          </div>

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="text-secondary-foreground hover:text-foreground transition flex items-center gap-2">
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <div className="text-sm text-secondary-foreground">{user.email}</div>
            <button
              onClick={handleLogout}
              className="text-secondary-foreground hover:text-foreground transition flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-secondary-foreground hover:text-foreground"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile navigation */}
        {isOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2 text-secondary-foreground hover:text-foreground hover:bg-secondary rounded transition"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center gap-2">
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </div>
              </Link>
            ))}
            <div className="border-t border-border mt-4 pt-4 px-4">
              <p className="text-sm text-secondary-foreground mb-3">{user.email}</p>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-secondary-foreground hover:text-foreground hover:bg-secondary rounded transition flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
