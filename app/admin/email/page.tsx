'use client'
import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import { apiGet, apiPost } from '@/lib/api'
import { Mail, Send, Users, UserCheck, RefreshCw, Clock, CheckCircle, XCircle } from 'lucide-react'

export default function AdminEmail() {
  const [stats, setStats] = useState<any>({
    total_sent: 0,
    sent_today: 0,
    breakdown: { welcome: 0, password_reset: 0, custom: 0 },
    recent: []
  })
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  
  // Email form state
  const [sendType, setSendType] = useState<'custom' | 'all_users' | 'all_mentors'>('custom')
  const [toEmails, setToEmails] = useState('')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [sendResult, setSendResult] = useState<any>(null)

  const loadStats = async () => {
    setLoading(true)
    try {
      const data = await apiGet('/admin/email/stats')
      setStats(data)
    } catch (err) {
      console.error('Failed to load email stats:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  const handleSendEmail = async () => {
    if (!subject || !message) {
      alert('Please fill in subject and message')
      return
    }
    
    if (sendType === 'custom' && !toEmails.trim()) {
      alert('Please enter at least one email address')
      return
    }
    
    setSending(true)
    setSendResult(null)
    
    try {
      const emailList = sendType === 'custom' 
        ? toEmails.split(',').map(e => e.trim()).filter(e => e)
        : []
      
      const result = await apiPost('/admin/email/send', {
        to_emails: emailList,
        subject,
        message,
        send_type: sendType
      })
      
      setSendResult(result)
      
      // Clear form on success
      if (result.success_count > 0) {
        setToEmails('')
        setSubject('')
        setMessage('')
        loadStats() // Refresh stats
      }
    } catch (err: any) {
      setSendResult({ error: err.message || 'Failed to send emails' })
    } finally {
      setSending(false)
    }
  }

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Email Center</h1>
            <p className="text-gray-500 mt-1">Send emails and view statistics</p>
          </div>
          <button
            onClick={loadStats}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 flex items-center gap-2"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail size={20} className="text-blue-600" />
              </div>
              <span className="text-gray-500 text-sm">Total Sent</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.total_sent}</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock size={20} className="text-green-600" />
              </div>
              <span className="text-gray-500 text-sm">Sent Today</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.sent_today}</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <UserCheck size={20} className="text-purple-600" />
              </div>
              <span className="text-gray-500 text-sm">Welcome Emails</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.breakdown?.welcome || 0}</p>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Send size={20} className="text-orange-600" />
              </div>
              <span className="text-gray-500 text-sm">Custom Emails</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.breakdown?.custom || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Send Email Form */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Send size={20} className="text-blue-600" />
              Send Email
            </h2>
            
            {/* Send Type Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Send To</label>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSendType('custom')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    sendType === 'custom' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Custom Emails
                </button>
                <button
                  onClick={() => setSendType('all_users')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    sendType === 'all_users' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Users
                </button>
                <button
                  onClick={() => setSendType('all_mentors')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    sendType === 'all_mentors' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Mentors
                </button>
              </div>
            </div>
            
            {/* Custom Email Input */}
            {sendType === 'custom' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Addresses (comma separated)
                </label>
                <textarea
                  value={toEmails}
                  onChange={(e) => setToEmails(e.target.value)}
                  placeholder="email1@example.com, email2@example.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={2}
                />
              </div>
            )}
            
            {/* Subject */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email subject"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Message */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your message here..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={6}
              />
            </div>
            
            {/* Send Result */}
            {sendResult && (
              <div className={`mb-4 p-4 rounded-xl ${
                sendResult.error 
                  ? 'bg-red-100 text-red-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {sendResult.error ? (
                  <p>{sendResult.error}</p>
                ) : (
                  <p>
                    ✅ {sendResult.success_count} email(s) sent successfully
                    {sendResult.failed_count > 0 && `, ${sendResult.failed_count} failed`}
                  </p>
                )}
              </div>
            )}
            
            {/* Send Button */}
            <button
              onClick={handleSendEmail}
              disabled={sending || !subject || !message}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-medium text-white disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <RefreshCw size={18} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Send Email
                </>
              )}
            </button>
          </div>

          {/* Recent Emails */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock size={20} className="text-gray-600" />
              Recent Emails
            </h2>
            
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : stats.recent?.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No emails sent yet</div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {stats.recent?.map((email: any, index: number) => (
                  <div 
                    key={email.id || index} 
                    className="p-4 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{email.subject}</p>
                        <p className="text-sm text-gray-500 truncate">{email.to}</p>
                        {email.temp_password && (
                          <p className="text-xs mt-1 font-mono bg-yellow-100 text-yellow-800 px-2 py-1 rounded inline-block">
                            Temp Pass: {email.temp_password}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        {email.status === 'sent' ? (
                          <CheckCircle size={16} className="text-green-500" />
                        ) : (
                          <XCircle size={16} className="text-red-500" />
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          email.type === 'welcome' ? 'bg-purple-100 text-purple-700' :
                          email.type === 'password_reset' ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {email.type}
                        </span>
                      </div>
                    </div>
                    {email.sent_at && (
                      <p className="text-xs text-gray-400 mt-2">
                        {new Date(email.sent_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
