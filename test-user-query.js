const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUser() {
  const email = 'admin@amicusonline.com'
  
  // Test the exact query used in auth
  const users = await prisma.$queryRaw`
    SELECT u.*, ur.role_name, ur.can_view_all_cases, ur.can_edit_all_cases, 
           ur.can_delete_cases, ur.can_manage_users, ur.can_manage_lookups,
           ur.can_assign_tasks, ur.can_view_reports
    FROM users u
    LEFT JOIN user_roles ur ON u.role_id = ur.id
    WHERE u.email = ${email}
  `
  
  console.log('Query result:', JSON.stringify(users, null, 2))
  
  await prisma.$disconnect()
}

checkUser().catch(console.error)
