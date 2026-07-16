import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: HomeIcon },
  { to: '/expenses', label: 'Expenses', icon: ExpenseIcon },
  { to: '/income', label: 'Income', icon: IncomeIcon },
  { to: '/budget', label: 'Budget', icon: BudgetIcon },
  { to: '/reports', label: 'Reports', icon: ReportsIcon },
]

export default function AppShell({ children }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = () => {
    signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-paper">
      {/* Desktop sidebar — styled like the spine of a passbook */}
      <aside className="hidden md:flex md:flex-col md:w-64 shrink-0 bg-pine-dark text-paper print:hidden">
        <div className="px-6 py-7 border-b border-paper/10">
          <p className="font-display text-2xl tracking-tight">FinTrack</p>
          <p className="text-xs text-paper/50 mt-0.5 font-mono">personal ledger</p>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive ? 'bg-gold/20 text-gold-light' : 'text-paper/75 hover:bg-paper/10 hover:text-paper'
                }`
              }
            >
              <Icon className="w-[18px] h-[18px]" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-5 border-t border-paper/10">
          <p className="text-xs text-paper/50 truncate mb-2">{user?.email}</p>
          <NavLink
            to="/settings"
            className="block text-sm text-paper/70 hover:text-gold-light transition-colors mb-3"
          >
            ⚙ Settings
          </NavLink>
          <button
            onClick={handleSignOut}
            className="text-sm text-paper/70 hover:text-gold-light transition-colors"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden flex items-center justify-between px-5 py-4 bg-pine-dark text-paper print:hidden">
        <p className="font-display text-xl">FinTrack</p>
        <button onClick={handleSignOut} className="text-xs text-paper/70">
          Sign out
        </button>
      </header>

      <main className="flex-1 px-5 md:px-10 py-6 md:py-10 pb-24 md:pb-10 max-w-5xl w-full mx-auto print:p-0 print:max-w-none">
        {children}
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-pine-dark border-t border-paper/10 flex justify-around py-2 z-40 print:hidden">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-medium transition-colors ${
                isActive ? 'text-gold-light' : 'text-paper/60'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

function HomeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M3 11.5 12 4l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 10v9a1 1 0 0 0 1 1H9a1 1 0 0 0 1-1v-4.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V19a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1v-9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ExpenseIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M18 6 6 18M6 8V6h2M18 16v2h-2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="7.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="16.5" cy="16.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

function IncomeIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M6 18 18 6M18 6H12M18 6v6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function BudgetIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="3.5" y="5" width="17" height="14" rx="2" />
      <path d="M3.5 10h17" strokeLinecap="round" />
      <path d="M8 14.5h3" strokeLinecap="round" />
    </svg>
  )
}

function ReportsIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <path d="M5 4h11l3 3v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
      <path d="M8 12v5M12 9v8M16 14v3" strokeLinecap="round" />
    </svg>
  )
}
