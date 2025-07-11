// Set DATABASE_URL environment variable directly
process.env.DATABASE_URL = "file:./dev.db"

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkCurrentUsersAndRoles() {
  console.log('📋 Current Users and Roles in Database')
  console.log('=====================================')
  
  try {
    // Check user roles first
    console.log('\n🔐 Available User Roles:')
    const roles = await prisma.$queryRaw`
      SELECT id, role_name, can_view_all_cases, can_edit_all_cases, can_delete_cases, 
             can_manage_users, can_manage_lookups, can_assign_tasks, can_view_reports
      FROM user_roles
      ORDER BY id
    `
    
    roles.forEach(role => {
      console.log(`ID: ${role.id} | Role: ${role.role_name}`)
      console.log(`  Permissions: View All Cases: ${role.can_view_all_cases}, Edit All Cases: ${role.can_edit_all_cases}`)
      console.log(`  Delete Cases: ${role.can_delete_cases}, Manage Users: ${role.can_manage_users}`)
      console.log(`  Manage Lookups: ${role.can_manage_lookups}, Assign Tasks: ${role.can_assign_tasks}`)
      console.log(`  View Reports: ${role.can_view_reports}`)
      console.log('---')
    })
    
    // Check current users
    console.log('\n👥 Current Users:')
    const users = await prisma.$queryRaw`
      SELECT u.id, u.first_name, u.last_name, u.email, u.is_active, ur.role_name
      FROM users u
      LEFT JOIN user_roles ur ON u.role_id = ur.id
      ORDER BY u.id
    `
    
    users.forEach(user => {
      console.log(`ID: ${user.id} | ${user.first_name} ${user.last_name}`)
      console.log(`  Email: ${user.email}`)
      console.log(`  Role: ${user.role_name}`)
      console.log(`  Active: ${user.is_active ? 'Yes' : 'No'}`)
      console.log('---')
    })
    
    console.log(`\nTotal Roles: ${roles.length}`)
    console.log(`Total Users: ${users.length}`)
    
  } catch (error) {
    console.error('❌ Error checking database:', error)
  }
  
  await prisma.$disconnect()
}

checkCurrentUsersAndRoles().catch(console.error)
