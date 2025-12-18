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
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedRole = localStorage.getItem('role')
    const mentorId = localStorage.getItem('mentor_id')
    
    console.log('DashboardLayout Check:', {
      hasToken: !!token,
      storedRole,
      expectedRole: role,
      mentorId,
      match: storedRole === role
    })
    
    if (!token) {
      console.log('No token found - redirecting to login')
      router.push('/')
      return
    }
    
    if (storedRole !== role) {
      console.log(`Role mismatch: stored="${storedRole}" expected="${role}" - redirecting`)
      router.push('/')
      return
    }
    
    console.log('Auth check passed - rendering dashboard')
    setIsLoading(false)
  }, [role, router])

  if (isLoading) {
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
