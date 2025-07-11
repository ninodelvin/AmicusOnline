import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'
import SignOutButton from '../../components/SignOutButton'

async function getCases(userId: number, userRole: string) {
  // Use raw SQL until Prisma client is fully regenerated
  if (userRole === 'SuperAdmin' || userRole === 'Admin') {
    return await prisma.$queryRaw`
      SELECT 
        c.id, c.case_number, c.title, c.description, c.date_filed, c.date_disposed, c.created_at,
        ct.type_name as case_type_name,
        ck.kind_name as case_kind_name,
        cs.status_name as case_status_name,
        cst.stage_name as case_stage_name,
        u.first_name as created_by_first_name, u.last_name as created_by_last_name
      FROM cases c
      LEFT JOIN case_types ct ON c.case_type_id = ct.id
      LEFT JOIN case_kinds ck ON c.case_kind_id = ck.id
      LEFT JOIN case_statuses cs ON c.case_status_id = cs.id
      LEFT JOIN case_stages cst ON c.case_stage_id = cst.id
      LEFT JOIN users u ON c.created_by = u.id
      ORDER BY c.created_at DESC
    `
  } else {
    return await prisma.$queryRaw`
      SELECT DISTINCT
        c.id, c.case_number, c.title, c.description, c.date_filed, c.date_disposed, c.created_at,
        ct.type_name as case_type_name,
        ck.kind_name as case_kind_name,
        cs.status_name as case_status_name,
        cst.stage_name as case_stage_name,
        u.first_name as created_by_first_name, u.last_name as created_by_last_name
      FROM cases c
      LEFT JOIN case_types ct ON c.case_type_id = ct.id
      LEFT JOIN case_kinds ck ON c.case_kind_id = ck.id
      LEFT JOIN case_statuses cs ON c.case_status_id = cs.id
      LEFT JOIN case_stages cst ON c.case_stage_id = cst.id
      LEFT JOIN users u ON c.created_by = u.id
      LEFT JOIN case_assignments ca ON c.id = ca.case_id
      WHERE ca.user_id = ${userId} AND ca.is_active = 1
      ORDER BY c.created_at DESC
    `
  }
}

export default async function CasesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/login')
  }

  const cases = await getCases(parseInt(session.user.id), session.user.role) as any[]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 mr-4">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Case Management</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">
                  Welcome, {session.user.name}
                </span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {session.user.role}
                </span>
                <SignOutButton />
              </div>
              <div className="border-l border-gray-300 pl-4">
                <Link 
                  href="/cases/new"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create New Case
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Total Cases</div>
            <div className="text-2xl font-bold text-gray-900">{cases.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Active Cases</div>
            <div className="text-2xl font-bold text-green-600">
              {cases.filter((c: any) => c.case_status_name !== 'Closed').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Criminal Defense</div>
            <div className="text-2xl font-bold text-red-600">
              {cases.filter((c: any) => c.case_kind_name === 'Criminal Defense').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">This Month</div>
            <div className="text-2xl font-bold text-blue-600">
              {cases.filter((c: any) => {
                const caseDate = new Date(c.created_at)
                const now = new Date()
                return caseDate.getMonth() === now.getMonth() && caseDate.getFullYear() === now.getFullYear()
              }).length}
            </div>
          </div>
        </div>

        {/* Cases Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">All Cases</h2>
          </div>
          
          {cases.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">No cases found</div>
              <Link 
                href="/cases/new"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Your First Case
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Case Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kind
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Stage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Filed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cases.map((case_: any) => (
                    <tr key={case_.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        <Link href={`/cases/${case_.id}`} className="hover:text-blue-800">
                          {case_.case_number}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {case_.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {case_.case_type_name || 'Not Set'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {case_.case_kind_name || 'Not Set'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          case_.case_status_name === 'Active' 
                            ? 'bg-green-100 text-green-800'
                            : case_.case_status_name === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {case_.case_status_name || 'Not Set'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {case_.case_stage_name || 'Not Set'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {case_.date_filed ? new Date(case_.date_filed).toLocaleDateString() : 'Not Set'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link 
                          href={`/cases/${case_.id}`}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          View
                        </Link>
                        <Link 
                          href={`/cases/${case_.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
