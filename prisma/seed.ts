import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting database seed...')

  // Create User Roles
  const superAdminRole = await prisma.userRole.upsert({
    where: { role_name: 'SuperAdmin' },
    update: {},
    create: {
      role_name: 'SuperAdmin',
      description: 'Full system access including lookup management',
      can_view_all_cases: true,
      can_edit_all_cases: true,
      can_delete_cases: true,
      can_manage_users: true,
      can_manage_lookups: true,
      can_assign_tasks: true,
      can_view_reports: true,
    },
  })

  const adminRole = await prisma.userRole.upsert({
    where: { role_name: 'Admin' },
    update: {},
    create: {
      role_name: 'Admin',
      description: 'Administrative access without lookup management',
      can_view_all_cases: true,
      can_edit_all_cases: true,
      can_delete_cases: false,
      can_manage_users: true,
      can_manage_lookups: false,
      can_assign_tasks: true,
      can_view_reports: true,
    },
  })

  const attorneyRole = await prisma.userRole.upsert({
    where: { role_name: 'Attorney' },
    update: {},
    create: {
      role_name: 'Attorney',
      description: 'Access to assigned cases only',
      can_view_all_cases: false,
      can_edit_all_cases: false,
      can_delete_cases: false,
      can_manage_users: false,
      can_manage_lookups: false,
      can_assign_tasks: false,
      can_view_reports: false,
    },
  })

  const paralegalRole = await prisma.userRole.upsert({
    where: { role_name: 'Paralegal' },
    update: {},
    create: {
      role_name: 'Paralegal',
      description: 'Access to assigned cases only',
      can_view_all_cases: false,
      can_edit_all_cases: false,
      can_delete_cases: false,
      can_manage_users: false,
      can_manage_lookups: false,
      can_assign_tasks: false,
      can_view_reports: false,
    },
  })

  // Create Priority Levels
  await prisma.priorityLevel.upsert({
    where: { level_name: 'Critical' },
    update: {},
    create: {
      level_name: 'Critical',
      level_value: 1,
      description: 'Requires immediate attention',
      color_code: '#DC2626', // Red
    },
  })

  await prisma.priorityLevel.upsert({
    where: { level_name: 'High' },
    update: {},
    create: {
      level_name: 'High',
      level_value: 2,
      description: 'High priority, address soon',
      color_code: '#EA580C', // Orange
    },
  })

  await prisma.priorityLevel.upsert({
    where: { level_name: 'Medium' },
    update: {},
    create: {
      level_name: 'Medium',
      level_value: 3,
      description: 'Normal priority',
      color_code: '#2563EB', // Blue
    },
  })

  await prisma.priorityLevel.upsert({
    where: { level_name: 'Low' },
    update: {},
    create: {
      level_name: 'Low',
      level_value: 4,
      description: 'Low priority, address when time allows',
      color_code: '#6B7280', // Gray
    },
  })

  // Create Case Types
  const caseTypes = [
    'Personal Injury',
    'Family Law',
    'Criminal Defense',
    'Corporate Law',
    'Real Estate',
    'Employment Law',
    'Immigration',
    'Estate Planning',
    'Bankruptcy',
    'Intellectual Property',
  ]

  for (const typeName of caseTypes) {
    await prisma.caseType.upsert({
      where: { type_name: typeName },
      update: {},
      create: {
        type_name: typeName,
        description: `${typeName} related cases`,
      },
    })
  }

  // Create Case Statuses
  await prisma.caseStatus.upsert({
    where: { status_name: 'Open' },
    update: {},
    create: {
      status_name: 'Open',
      description: 'Case is actively being worked on',
      color_code: '#16A34A', // Green
    },
  })

  await prisma.caseStatus.upsert({
    where: { status_name: 'Pending' },
    update: {},
    create: {
      status_name: 'Pending',
      description: 'Case is waiting for something',
      color_code: '#CA8A04', // Yellow
    },
  })

  await prisma.caseStatus.upsert({
    where: { status_name: 'Closed' },
    update: {},
    create: {
      status_name: 'Closed',
      description: 'Case has been completed',
      color_code: '#6B7280', // Gray
    },
  })

  await prisma.caseStatus.upsert({
    where: { status_name: 'On Hold' },
    update: {},
    create: {
      status_name: 'On Hold',
      description: 'Case is temporarily suspended',
      color_code: '#DC2626', // Red
    },
  })

  // Create Document Types
  const documentTypes = [
    'Contract',
    'Legal Brief',
    'Court Filing',
    'Evidence',
    'Correspondence',
    'Research',
    'Deposition',
    'Settlement Agreement',
    'Motion',
    'Pleading',
    'Discovery',
    'Expert Report',
  ]

  for (const typeName of documentTypes) {
    await prisma.documentType.upsert({
      where: { type_name: typeName },
      update: {},
      create: {
        type_name: typeName,
        description: `${typeName} documents`,
      },
    })
  }

  // Create Document Statuses
  await prisma.documentStatus.upsert({
    where: { status_name: 'Draft' },
    update: {},
    create: {
      status_name: 'Draft',
      description: 'Document is being created',
      color_code: '#6B7280', // Gray
    },
  })

  await prisma.documentStatus.upsert({
    where: { status_name: 'In Review' },
    update: {},
    create: {
      status_name: 'In Review',
      description: 'Document is being reviewed',
      color_code: '#CA8A04', // Yellow
    },
  })

  await prisma.documentStatus.upsert({
    where: { status_name: 'Approved' },
    update: {},
    create: {
      status_name: 'Approved',
      description: 'Document has been approved',
      color_code: '#16A34A', // Green
    },
  })

  await prisma.documentStatus.upsert({
    where: { status_name: 'Rejected' },
    update: {},
    create: {
      status_name: 'Rejected',
      description: 'Document has been rejected',
      color_code: '#DC2626', // Red
    },
  })

  await prisma.documentStatus.upsert({
    where: { status_name: 'Final' },
    update: {},
    create: {
      status_name: 'Final',
      description: 'Document is finalized',
      color_code: '#2563EB', // Blue
    },
  })

  // Create default SuperAdmin user
  const hashedPassword = await bcrypt.hash('AmicusAdmin2024!', 10)
  
  await prisma.user.upsert({
    where: { email: 'admin@amicusonline.com' },
    update: {},
    create: {
      email: 'admin@amicusonline.com',
      password_hash: hashedPassword,
      first_name: 'System',
      last_name: 'Administrator',
      phone: '+1-555-0100',
      role_id: superAdminRole.id,
    },
  })

  console.log('Database seed completed successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
