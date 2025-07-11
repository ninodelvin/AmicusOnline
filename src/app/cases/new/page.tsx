'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import SignOutButton from '@/components/SignOutButton'

interface CaseType {
  id: number
  type_name: string
}

interface CaseStatus {
  id: number
  status_name: string
}

interface CaseKind {
  id: number
  kind_name: string
}

interface CaseStage {
  id: number
  stage_name: string
}

interface User {
  id: number
  first_name: string
  last_name: string
  email: string
}

export default function NewCasePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Form data
  const [caseData, setCaseData] = useState({
    title: '',
    description: '',
    date_filed: '',
    date_disposed: '',
    case_type_id: '',
    case_kind_id: '',
    case_status_id: '',
    case_stage_id: '',
    assigned_users: [] as number[]
  })

  // Lookup data
  const [caseTypes, setCaseTypes] = useState<CaseType[]>([])
  const [caseKinds, setCaseKinds] = useState<CaseKind[]>([])
  const [caseStatuses, setCaseStatuses] = useState<CaseStatus[]>([])
  const [caseStages, setCaseStages] = useState<CaseStage[]>([])
  const [users, setUsers] = useState<User[]>([])

  // Load lookup data
  useEffect(() => {
    async function loadLookups() {
      try {
        const [typesRes, kindsRes, statusesRes, stagesRes, usersRes] = await Promise.all([
          fetch('/api/lookups/case-types'),
          fetch('/api/lookups/case-kinds'),
          fetch('/api/lookups/case-statuses'),
          fetch('/api/lookups/case-stages'),
          fetch('/api/users')
        ])

        if (typesRes.ok) setCaseTypes(await typesRes.json())
        if (kindsRes.ok) setCaseKinds(await kindsRes.json())
        if (statusesRes.ok) setCaseStatuses(await statusesRes.json())
        if (stagesRes.ok) setCaseStages(await stagesRes.json())
        if (usersRes.ok) setUsers(await usersRes.json())
      } catch (error) {
        console.error('Error loading lookups:', error)
      }
    }

    if (session) {
      loadLookups()
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(caseData),
      })

      if (response.ok) {
        const newCase = await response.json()
        // For now, redirect to cases list since individual case view isn't implemented yet
        router.push('/cases')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to create case')
      }
    } catch (error) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleUserSelection = (userId: number) => {
    setCaseData(prev => ({
      ...prev,
      assigned_users: prev.assigned_users.includes(userId)
        ? prev.assigned_users.filter(id => id !== userId)
        : [...prev.assigned_users, userId]
    }))
  }

  if (status === 'loading') return <div>Loading...</div>
  if (!session) return <div>Access denied</div>

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/cases" className="text-blue-600 hover:text-blue-800 mr-4">
                ← Back to Cases
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Create New Case</h1>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-700">
                Welcome, {session.user.name}
              </span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {session.user.role}
              </span>
              <SignOutButton />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Case Information</h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="text-red-800">{error}</div>
              </div>
            )}

            {/* Case Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Case Title *
              </label>
              <input
                type="text"
                id="title"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={caseData.title}
                onChange={(e) => setCaseData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter case title"
              />
            </div>

            {/* Case Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={caseData.description}
                onChange={(e) => setCaseData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter case description"
              />
            </div>

            {/* Date Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date Filed */}
              <div>
                <label htmlFor="date_filed" className="block text-sm font-medium text-gray-700 mb-2">
                  Date Filed
                </label>
                <input
                  type="date"
                  id="date_filed"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={caseData.date_filed}
                  onChange={(e) => setCaseData(prev => ({ ...prev, date_filed: e.target.value }))}
                />
              </div>

              {/* Date Disposed */}
              <div>
                <label htmlFor="date_disposed" className="block text-sm font-medium text-gray-700 mb-2">
                  Date Disposed
                </label>
                <input
                  type="date"
                  id="date_disposed"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={caseData.date_disposed}
                  onChange={(e) => setCaseData(prev => ({ ...prev, date_disposed: e.target.value }))}
                />
              </div>
            </div>

            {/* Row 1: Type, Kind, Status, Stage */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Case Type */}
              <div>
                <label htmlFor="case_type_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Case Type *
                </label>
                <select
                  id="case_type_id"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={caseData.case_type_id}
                  onChange={(e) => setCaseData(prev => ({ ...prev, case_type_id: e.target.value }))}
                >
                  <option value="">Select case type</option>
                  {caseTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.type_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Case Kind */}
              <div>
                <label htmlFor="case_kind_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Case Kind *
                </label>
                <select
                  id="case_kind_id"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={caseData.case_kind_id}
                  onChange={(e) => setCaseData(prev => ({ ...prev, case_kind_id: e.target.value }))}
                >
                  <option value="">Select case kind</option>
                  {caseKinds.map(kind => (
                    <option key={kind.id} value={kind.id}>
                      {kind.kind_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Case Status */}
              <div>
                <label htmlFor="case_status_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  id="case_status_id"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={caseData.case_status_id}
                  onChange={(e) => setCaseData(prev => ({ ...prev, case_status_id: e.target.value }))}
                >
                  <option value="">Select status</option>
                  {caseStatuses.map(status => (
                    <option key={status.id} value={status.id}>
                      {status.status_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Case Stage */}
              <div>
                <label htmlFor="case_stage_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Case Stage *
                </label>
                <select
                  id="case_stage_id"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={caseData.case_stage_id}
                  onChange={(e) => setCaseData(prev => ({ ...prev, case_stage_id: e.target.value }))}
                >
                  <option value="">Select stage</option>
                  {caseStages.map(stage => (
                    <option key={stage.id} value={stage.id}>
                      {stage.stage_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Assign Users */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign Team Members
              </label>
              <div className="border border-gray-300 rounded-md p-4 max-h-48 overflow-y-auto">
                {users.map(user => (
                  <div key={user.id} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id={`user-${user.id}`}
                      className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      checked={caseData.assigned_users.includes(user.id)}
                      onChange={() => handleUserSelection(user.id)}
                    />
                    <label htmlFor={`user-${user.id}`} className="text-sm text-gray-700">
                      {user.first_name} {user.last_name} ({user.email})
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <Link
                href="/cases"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Creating...' : 'Create Case'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
