import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// GET /api/cases - List cases
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = parseInt(session.user.id)
    const userRole = session.user.role

    let cases
    
    // Use raw SQL until Prisma client is fully regenerated
    if (userRole === 'SuperAdmin' || userRole === 'Admin') {
      cases = await prisma.$queryRaw`
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
      cases = await prisma.$queryRaw`
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

    return NextResponse.json(cases)
  } catch (error) {
    console.error('Error fetching cases:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/cases - Create new case
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, date_filed, date_disposed, case_type_id, case_kind_id, case_status_id, case_stage_id, assigned_users } = body

    // Validate required fields
    if (!title || !case_type_id || !case_kind_id || !case_status_id || !case_stage_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const userId = parseInt(session.user.id)

    // Generate case number (simple format: CASE-YYYYMMDD-XXX)
    const today = new Date()
    const dateStr = today.getFullYear().toString() + 
                   (today.getMonth() + 1).toString().padStart(2, '0') + 
                   today.getDate().toString().padStart(2, '0')
    
    // Count cases created today to generate sequence number
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
    
    const todayCases = await prisma.case.count({
      where: {
        created_at: {
          gte: todayStart,
          lt: todayEnd
        }
      }
    })
    
    const sequenceNumber = (todayCases + 1).toString().padStart(3, '0')
    const caseNumber = `CASE-${dateStr}-${sequenceNumber}`

    // Create the case using raw SQL
    const now = new Date()
    const result = await prisma.$queryRaw`
      INSERT INTO cases (
        case_number, title, description, date_filed, date_disposed, 
        case_type_id, case_kind_id, case_status_id, case_stage_id, created_by,
        created_at, updated_at
      ) VALUES (
        ${caseNumber}, ${title}, ${description || null}, 
        ${date_filed ? new Date(date_filed) : null}, 
        ${date_disposed ? new Date(date_disposed) : null},
        ${parseInt(case_type_id)}, ${parseInt(case_kind_id)}, 
        ${parseInt(case_status_id)}, ${parseInt(case_stage_id)}, ${userId},
        ${now}, ${now}
      )
    `

    // Get the newly created case
    const newCase = await prisma.$queryRaw`
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
      WHERE c.case_number = ${caseNumber}
      ORDER BY c.id DESC
      LIMIT 1
    ` as any[]

    const createdCase = newCase[0]

    // Create case assignments if users are assigned
    if (assigned_users && assigned_users.length > 0) {
      for (const assignedUserId of assigned_users) {
        await prisma.$executeRaw`
          INSERT INTO case_assignments (case_id, user_id, assigned_by, is_active) 
          VALUES (${createdCase.id}, ${assignedUserId}, ${userId}, 1)
        `
      }
    }

    // Log the creation (simplified for now)
    try {
      await prisma.$executeRaw`
        INSERT INTO audit_logs (user_id, action, table_name, record_id, ip_address, user_agent, created_at) 
        VALUES (${userId}, 'CREATE_CASE', 'cases', ${createdCase.id}, 'unknown', 'unknown', ${new Date()})
      `
    } catch (auditError) {
      console.log('Audit log failed:', auditError)
      // Don't fail the whole operation if audit logging fails
    }

    return NextResponse.json(createdCase, { status: 201 })
  } catch (error) {
    console.error('Error creating case:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
