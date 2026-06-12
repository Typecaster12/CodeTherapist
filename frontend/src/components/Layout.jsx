import { Outlet, Link } from 'react-router-dom'
import { Stethoscope } from 'lucide-react'

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-indigo-600">
            <Stethoscope className="w-6 h-6" />
            Code Therapist
          </Link>
          <nav className="flex space-x-6">
            <Link to="/diagnose" className="text-gray-600 hover:text-indigo-600 font-medium">Diagnose</Link>
            <Link to="/dashboard" className="text-gray-600 hover:text-indigo-600 font-medium">Dashboard</Link>
          </nav>
        </div>
      </header>
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-6 text-center text-gray-500 text-sm mt-auto">
        <p>Code Therapist &copy; {new Date().getFullYear()} - Diagnose why you're stuck.</p>
      </footer>
    </div>
  )
}
