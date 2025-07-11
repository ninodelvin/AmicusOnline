import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Link from 'next/link'

async function getCases(userId: number, userRole: string) {
  // SuperAdmins and Admins can see all cases
  if (userRole === 'SuperAdmin' || userRole === 'Admin') {
    return await prisma.case.findMany({
      include: {
        case_type: true,
        case_status: true,
        priority_level: true,
        created_by_user: {
          select: {
            first_name: true,
            last_name: true,
          }
        },
        case_assignments: {
          include: {
            user: {
              select: {
                first_name: true,
                last_name: true,
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })
  } else {
    // Attorneys and Paralegals only see assigned cases
    return await prisma.case.findMany({
      where: {
        case_assignments: {
          some: {
            user_id: userId,
            is_active: true
          }
        }
      },
      include: {
        case_type: true,
        case_status: true,
        priority_level: true,
        created_by_user: {
          select: {
            first_name: true,
            last_name: true,
          }
        },
        case_assignments: {
          include: {
            user: {
              select: {
                first_name: true,
                last_name: true,
              }
            }
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    })
  }
}

export default async function CasesPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/auth/login')
  }

  const cases = await getCases(parseInt(session.user.id), session.user.role)

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
              {cases.filter(c => c.case_status.status_name !== 'Closed').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">High Priority</div>
            <div className="text-2xl font-bold text-red-600">
              {cases.filter(c => c.priority_level.level_name === 'High').length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">This Month</div>
            <div className="text-2xl font-bold text-blue-600">
              {cases.filter(c => {
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
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cases.map((case_) => (
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
                        {case_.case_type.type_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          case_.case_status.status_name === 'Active' 
                            ? 'bg-green-100 text-green-800'
                            : case_.case_status.status_name === 'Pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {case_.case_status.status_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          case_.priority_level.level_name === 'High'
                            ? 'bg-red-100 text-red-800'
                            : case_.priority_level.level_name === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {case_.priority_level.level_name}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {case_.case_assignments.map(assignment => 
                          `${assignment.user.first_name} ${assignment.user.last_name}`
                        ).join(', ') || 'Unassigned'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(case_.created_at).toLocaleDateString()}
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
