import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const caseTypes = await prisma.caseType.findMany({
      where: { is_active: true },
      orderBy: { type_name: 'asc' }
    })

    return NextResponse.json(caseTypes)
  } catch (error) {
    console.error('Error fetching case types:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
