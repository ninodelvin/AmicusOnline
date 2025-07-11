'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import SignOutButton from '@/components/SignOutButton'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex justify-between items-center h-12">
            <div className="flex items-center">
              <h1 className="text-lg font-bold text-blue-900">AmicusOnline</h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <span className="text-xs text-gray-700">
                Welcome, {session.user.name}
              </span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {session.user.role}
              </span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Dashboard</h2>
          <p className="text-sm text-gray-600">Welcome to your case management system</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-1 bg-blue-100 rounded-lg">
                {/* Icon removed */}
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Total Cases</p>
                <p className="text-lg font-semibold text-gray-900">-</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-1 bg-green-100 rounded-lg">
                {/* Icon removed */}
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Active Cases</p>
                <p className="text-lg font-semibold text-gray-900">-</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-1 bg-yellow-100 rounded-lg">
                {/* Icon removed */}
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Pending Tasks</p>
                <p className="text-lg font-semibold text-gray-900">-</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center">
              <div className="p-1 bg-purple-100 rounded-lg">
                {/* Icon removed */}
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Documents</p>
                <p className="text-lg font-semibold text-gray-900">-</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-base font-medium text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-4 space-y-3">
              <Link 
                href="/cases/new" 
                className="flex items-center p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <span className="text-sm text-gray-900 font-medium">Create New Case</span>
              </Link>

              <Link 
                href="/cases" 
                className="flex items-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm text-gray-900 font-medium">View All Cases</span>
              </Link>

              <Link 
                href="/documents" 
                className="flex items-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <span className="text-sm text-gray-900 font-medium">Document Library</span>
              </Link>

              {session.user.permissions.canManageUsers && (
                <Link 
                  href="/users" 
                  className="flex items-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <span className="text-sm text-gray-900 font-medium">Manage Users</span>
                </Link>
              )}

              {session.user.permissions.canManageLookups && (
                <Link 
                  href="/admin/lookups" 
                  className="flex items-center p-2 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
                >
                  <span className="text-sm text-gray-900 font-medium">System Administration</span>
                </Link>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-base font-medium text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-4">
              <div className="text-center text-gray-500 py-6">
                <p className="text-sm">No recent activity to display</p>
                <p className="text-xs">Start by creating your first case</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
