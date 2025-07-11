// Simple test to verify our database structure
import { prisma } from '@/lib/db'

export default async function TestPage() {
  // Just test our lookup tables
  let caseTypes, caseKinds, caseStages, caseStatuses

  try {
    caseTypes = await prisma.$queryRaw`SELECT * FROM case_types LIMIT 5`
    caseKinds = await prisma.$queryRaw`SELECT * FROM case_kinds LIMIT 5`
    caseStages = await prisma.$queryRaw`SELECT * FROM case_stages LIMIT 5`
    caseStatuses = await prisma.$queryRaw`SELECT * FROM case_statuses LIMIT 5`
  } catch (error) {
    console.error('Database error:', error)
    return <div>Database error: {String(error)}</div>
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Database Test - MVP Case Schema</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-bold mb-2">Case Types</h2>
          <pre className="text-sm">{JSON.stringify(caseTypes, null, 2)}</pre>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-bold mb-2">Case Kinds</h2>
          <pre className="text-sm">{JSON.stringify(caseKinds, null, 2)}</pre>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-bold mb-2">Case Stages</h2>
          <pre className="text-sm">{JSON.stringify(caseStages, null, 2)}</pre>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-bold mb-2">Case Statuses</h2>
          <pre className="text-sm">{JSON.stringify(caseStatuses, null, 2)}</pre>
        </div>
      </div>
    </div>
  )
}
