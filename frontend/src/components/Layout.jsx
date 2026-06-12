import { Outlet, Link } from 'react-router-dom'
import { Stethoscope } from 'lucide-react'
import InteractiveBackground from './InteractiveBackground'

export default function Layout() {
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
          <nav className="flex space-x-6">
            <Link to="/diagnose" className="text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Diagnose</Link>
            <Link to="/dashboard" className="text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Dashboard</Link>
          </nav>
        </div>
      </header>
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <Outlet />
      </main>
      
      <footer className="border-t border-[var(--border-subtle)] py-6 text-center text-[var(--text-muted)] text-[11px] mt-auto bg-[#12111a]/80 backdrop-blur-md relative z-10">
        <p>Code Therapist &copy; {new Date().getFullYear()} - Diagnose why you're stuck.</p>
      </footer>
    </div>
  )
}

