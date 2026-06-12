import { useState } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { Stethoscope, LogIn, UserPlus, LogOut, User, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import InteractiveBackground from './InteractiveBackground'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[var(--bg-void)] text-[var(--text-primary)] font-sans flex flex-col selection:bg-[var(--border-muted)] selection:text-[var(--text-primary)] relative">
      {/* Dynamic Background Effect */}
      <InteractiveBackground />

      <header className="bg-[#12111a]/80 backdrop-blur-md border-b border-[var(--border-subtle)] sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-[18px] font-semibold text-[var(--text-primary)]">
            <Stethoscope className="w-5 h-5 text-[var(--text-secondary)]" />
            Code Therapist
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-5">
            {isAuthenticated ? (
              <>
                <Link to="/diagnose" className="text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                  Diagnose
                </Link>
                <Link to="/dashboard" className="text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                  Dashboard
                </Link>
                {/* User chip */}
                <div className="flex items-center gap-2 pl-3 border-l border-[var(--border-subtle)]">
                  <div className="flex items-center gap-1.5 text-[12px] text-[var(--text-muted)]">
                    <User className="w-3.5 h-3.5" />
                    <span className="font-medium text-[var(--text-secondary)]">{user?.username}</span>
                  </div>
                  <button
                    id="navbar-logout"
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-[12px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors ml-1 cursor-pointer"
                    title="Sign out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Login
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 text-[13px] font-medium px-3.5 py-1.5 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--border-muted)] transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Register
                </Link>
              </>
            )}
          </nav>

          {/* Hamburger Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden flex items-center justify-center p-2 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

        {/* Mobile Dropdown Tray */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="md:hidden border-b border-[var(--border-subtle)] bg-[#12111a] px-4 pt-2 pb-4 space-y-3"
            >
              {isAuthenticated ? (
                <div className="flex flex-col space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-[var(--border-subtle)] text-[12px] text-[var(--text-muted)]">
                    <User className="w-4 h-4" />
                    <span>Logged in as: <strong className="text-[var(--text-secondary)]">{user?.username}</strong></span>
                  </div>
                  <Link
                    to="/diagnose"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors py-1"
                  >
                    Diagnose
                  </Link>
                  <Link
                    to="/dashboard"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors py-1"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false)
                      handleLogout()
                    }}
                    className="w-full text-left flex items-center gap-2 text-[13px] font-medium text-red-400 hover:text-red-350 transition-colors py-2 border-t border-[var(--border-subtle)] cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-3">
                  <Link
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors py-1.5"
                  >
                    <LogIn className="w-4 h-4" />
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 text-[13px] font-medium px-4 py-2 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--border-muted)] transition-colors w-full justify-center"
                  >
                    <UserPlus className="w-4 h-4" />
                    Register
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <Outlet />
      </main>

      <footer className="border-t border-[var(--border-subtle)] py-6 text-center text-[var(--text-muted)] text-[11px] mt-auto bg-[#12111a]/80 backdrop-blur-md relative z-10">
        <p>Code Therapist &copy; {new Date().getFullYear()} - Diagnose why you&apos;re stuck.</p>
      </footer>
    </div>
  )
}
