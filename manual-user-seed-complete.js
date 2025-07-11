const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Creating user roles...')
  
  // Create user roles first
  const roles = [
    ['SuperAdmin', 'Super Administrator', 1, 1, 1, 1, 1, 1, 1],
    ['Admin', 'Administrator', 1, 1, 1, 1, 1, 1, 1], 
    ['Attorney', 'Attorney', 1, 1, 0, 0, 0, 1, 1],
    ['Paralegal', 'Paralegal', 0, 0, 0, 0, 0, 0, 1]
  ]
  
  for (const [role_name, description, can_view_all_cases, can_edit_all_cases, can_delete_cases, can_manage_users, can_manage_lookups, can_assign_tasks, can_view_reports] of roles) {
    try {
      const existing = await prisma.$queryRaw`SELECT * FROM user_roles WHERE role_name = ${role_name}`
      
      if (existing.length === 0) {
        await prisma.$executeRaw`
          INSERT INTO user_roles (
            role_name, description, can_view_all_cases, can_edit_all_cases, 
            can_delete_cases, can_manage_users, can_manage_lookups, 
            can_assign_tasks, can_view_reports
          ) VALUES (
            ${role_name}, ${description}, ${can_view_all_cases}, ${can_edit_all_cases},
            ${can_delete_cases}, ${can_manage_users}, ${can_manage_lookups},
            ${can_assign_tasks}, ${can_view_reports}
          )
        `
        console.log(`Created role: ${role_name}`)
      } else {
        console.log(`Role already exists: ${role_name}`)
      }
    } catch (error) {
      console.error(`Error creating role ${role_name}:`, error)
    }
  }
  
  console.log('Creating users...')
  
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  // Get role IDs
  const superAdminRole = await prisma.$queryRaw`SELECT id FROM user_roles WHERE role_name = 'SuperAdmin'`
  const attorneyRole = await prisma.$queryRaw`SELECT id FROM user_roles WHERE role_name = 'Attorney'`
  const paralegalRole = await prisma.$queryRaw`SELECT id FROM user_roles WHERE role_name = 'Paralegal'`
  
  const users = [
    ['admin@amicusonline.com', hashedPassword, 'Admin', 'User', superAdminRole[0].id],
    ['attorney@amicusonline.com', hashedPassword, 'John', 'Attorney', attorneyRole[0].id],
    ['paralegal@amicusonline.com', hashedPassword, 'Jane', 'Paralegal', paralegalRole[0].id]
  ]
  
  for (const [email, password_hash, first_name, last_name, role_id] of users) {
    try {
      const existing = await prisma.$queryRaw`SELECT * FROM users WHERE email = ${email}`
      
      if (existing.length === 0) {
        await prisma.$executeRaw`
          INSERT INTO users (email, password_hash, first_name, last_name, role_id, is_active, created_at, updated_at)
          VALUES (${email}, ${password_hash}, ${first_name}, ${last_name}, ${role_id}, 1, ${new Date()}, ${new Date()})
        `
        console.log(`Created user: ${email}`)
      } else {
        console.log(`User already exists: ${email}`)
      }
    } catch (error) {
      console.error(`Error creating user ${email}:`, error)
    }
  }
  
  console.log('User seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
