'use client'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import StatsCard from '@/components/StatsCard'
import { apiGet } from '@/lib/api'
import { Users, UserCheck, DollarSign, UserCog, Key, Clock, Bell, Calendar, TrendingUp, TrendingDown } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [upcomingNews, setUpcomingNews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Fetch users, mentors, licenses, and news
      const [usersData, mentorsData, licensesData, newsData] = await Promise.all([
        apiGet('/admin/users'),
        apiGet('/admin/mentors').catch(() => []),
        apiGet('/admin/licenses').catch(() => []),
        apiGet('/admin/news').catch(() => ({ news: [] }))
      ])

      // Handle different response formats
      const users = usersData?.users || usersData || []
      const mentors = Array.isArray(mentorsData) ? mentorsData : (mentorsData?.mentors || [])
      const licenses = Array.isArray(licensesData) ? licensesData : (licensesData?.licenses || [])
      const news = newsData?.news || newsData || []

      console.log('Users:', users.length, 'Mentors:', mentors.length, 'Licenses:', licenses.length, 'News:', news.length)

      // Calculate stats from actual data
      const calculatedStats = {
        user_stats: {
          total: users.length,
          active: users.filter((u: any) => u.status === 'active').length,
          pending: users.filter((u: any) => u.status === 'pending').length,
          paid: users.filter((u: any) => u.payment_status === 'paid').length,
        },
        mentor_stats: {
          total: mentors.length,
          active: mentors.filter((m: any) => m.status === 'active').length,
        },
        license_stats: {
          total: licenses.length,
          used: licenses.filter((l: any) => l.used === true).length,
        },
        revenue_stats: {
          total_revenue: 0,
        }
      }

      setStats(calculatedStats)
      setRecentUsers(users.slice(0, 5))
      
      // Filter and sort upcoming news (future events first)
      const now = new Date()
      const sortedNews = news
        .sort((a: any, b: any) => {
          const dateA = new Date(a.event_time || a.created_at)
          const dateB = new Date(b.event_time || b.created_at)
          return dateB.getTime() - dateA.getTime()
        })
        .slice(0, 5)
      setUpcomingNews(sortedNews)
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-700'
      case 'medium': return 'bg-yellow-100 text-yellow-700'
      case 'low': return 'bg-green-100 text-green-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  const isUpcoming = (dateStr: string) => {
    try {
      return new Date(dateStr) > new Date()
    } catch {
      return false
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back! Here's what's happening.</p>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Users"
              value={stats.user_stats?.total || 0}
              icon={Users}
              color="blue"
            />
            <StatsCard
              title="Active Users"
              value={stats.user_stats?.active || 0}
              icon={UserCheck}
              color="green"
            />
            <StatsCard
              title="Paid Users"
              value={stats.user_stats?.paid || 0}
              icon={DollarSign}
              color="purple"
            />
            <StatsCard
              title="Total Revenue"
              value={`$${stats.revenue_stats?.total_revenue || 0}`}
              icon={DollarSign}
              color="orange"
            />
          </div>
        )}

        {/* Second Row Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatsCard
              title="Total Mentors"
              value={stats.mentor_stats?.total || 0}
              icon={UserCog}
              color="purple"
            />
            <StatsCard
              title="Active Licenses"
              value={stats.license_stats?.used || 0}
              icon={Key}
              color="green"
              subtitle={`of ${stats.license_stats?.total || 0} total`}
            />
            <StatsCard
              title="Pending Users"
              value={stats.user_stats?.pending || 0}
              icon={Clock}
              color="orange"
            />
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming News Events */}
          <div className="bg-white rounded-2xl border border-gray-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">News Events</h2>
              </div>
              <a href="/admin/news" className="text-sm text-blue-600 hover:underline">View all</a>
            </div>
            <div className="divide-y divide-gray-100">
              {upcomingNews.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell size={32} className="mx-auto text-gray-300 mb-2" />
                  <p>No news events</p>
                </div>
              ) : (
                upcomingNews.map((item: any) => (
                  <div key={item.id || item._id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900 text-sm">{item.title}</h3>
                          {isUpcoming(item.event_time) && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                              Upcoming
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {item.currency && (
                            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                              {item.currency}
                            </span>
                          )}
                          {item.impact && (
                            <span className={`px-2 py-0.5 rounded-full ${getImpactColor(item.impact)}`}>
                              {item.impact}
                            </span>
                          )}
                          <span>
                            {item.event_time ? new Date(item.event_time).toLocaleString() : ''}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-white rounded-2xl border border-gray-200">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users size={20} className="text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
              </div>
              <a href="/admin/users" className="text-sm text-blue-600 hover:underline">View all</a>
            </div>
            <div className="divide-y divide-gray-100">
              {recentUsers.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No users yet</div>
              ) : (
                recentUsers.map((user: any) => (
                  <div key={user._id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {(user.name || user.email)?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{user.name || 'No name'}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {user.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
