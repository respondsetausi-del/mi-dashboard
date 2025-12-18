'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from './Sidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
  role: 'admin' | 'mentor'
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const router = useRouter()
  const [authState, setAuthState] = useState<'checking' | 'authorized' | 'unauthorized'>('checking')

  useEffect(() => {
    // Only run once on mount - no dependencies that could cause re-runs
    const token = localStorage.getItem('token')
    const storedRole = localStorage.getItem('role')
    
    console.log('DashboardLayout Auth Check:', { 
      hasToken: !!token, 
      storedRole, 
      expectedRole: role 
    })
    
    if (token && storedRole === role) {
      console.log('✅ Auth passed - showing dashboard')
      setAuthState('authorized')
    } else {
      console.log('❌ Auth failed - redirecting to login')
      setAuthState('unauthorized')
      router.replace('/')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency array = run once on mount only

  if (authState === 'checking') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (authState === 'unauthorized') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar role={role} />
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}
