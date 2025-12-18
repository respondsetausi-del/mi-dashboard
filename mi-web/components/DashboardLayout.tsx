'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from './Sidebar'

interface DashboardLayoutProps {
  children: React.ReactNode
  role: 'admin' | 'mentor'
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const checkCount = useRef(0)

  useEffect(() => {
    // Function to check auth with retry logic
    const checkAuth = () => {
      checkCount.current += 1
      
      const token = localStorage.getItem('token')
      const storedRole = localStorage.getItem('role')
      const mentorId = localStorage.getItem('mentor_id')
      
      console.log(`DashboardLayout Auth Check #${checkCount.current}:`, {
        hasToken: !!token,
        tokenLength: token?.length,
        storedRole,
        expectedRole: role,
        mentorId,
        match: storedRole === role
      })
      
      // If we have valid auth, proceed
      if (token && storedRole === role) {
        console.log('Auth check passed - rendering dashboard')
        setIsAuthorized(true)
        setIsLoading(false)
        return true
      }
      
      return false
    }
    
    // First immediate check
    if (checkAuth()) {
      return
    }
    
    // If first check fails, wait and retry (handles race condition from login redirect)
    const retryTimeout = setTimeout(() => {
      console.log('Retrying auth check after 100ms delay...')
      if (!checkAuth()) {
        // After retry, if still no auth, redirect
        const token = localStorage.getItem('token')
        const storedRole = localStorage.getItem('role')
        
        if (!token) {
          console.log('No token found after retry - redirecting to login')
          router.push('/')
        } else if (storedRole !== role) {
          console.log(`Role mismatch after retry: stored="${storedRole}" expected="${role}" - redirecting`)
          router.push('/')
        }
      }
    }, 100)
    
    return () => clearTimeout(retryTimeout)
  }, [role, router])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthorized) {
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
