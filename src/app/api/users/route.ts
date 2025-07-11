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

    // Get all active users with their roles using raw SQL for consistency
    const users = await prisma.$queryRaw`
      SELECT 
        u.id, 
        u.first_name, 
        u.last_name, 
        u.email, 
        u.is_active,
        u.created_at,
        u.last_login,
        ur.role_name
      FROM users u
      LEFT JOIN user_roles ur ON u.role_id = ur.id
      WHERE u.is_active = 1
      ORDER BY ur.id, u.first_name, u.last_name
    `

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
