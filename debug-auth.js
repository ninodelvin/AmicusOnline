const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function debugAuth() {
  console.log('🔍 Debugging Authentication Issue')
  
  const email = 'admin@amicusonline.com'
  const testPassword = 'password123'
  
  // Get user data exactly as auth does
  const users = await prisma.$queryRaw`
    SELECT u.*, ur.role_name, ur.can_view_all_cases, ur.can_edit_all_cases, 
           ur.can_delete_cases, ur.can_manage_users, ur.can_manage_lookups,
           ur.can_assign_tasks, ur.can_view_reports
    FROM users u
    LEFT JOIN user_roles ur ON u.role_id = ur.id
    WHERE u.email = ${email}
  `
  
  const user = users[0]
  
  if (user) {
    console.log('User found:', {
      id: user.id,
      email: user.email,
      password_hash: user.password_hash.substring(0, 20) + '...',
      role: user.role_name,
      is_active: user.is_active,
      failed_attempts: user.failed_login_attempts
    })
    
    // Test password comparison
    console.log('\nTesting password...')
    console.log('Test password:', testPassword)
    console.log('Stored hash:', user.password_hash)
    
    const isValid = await bcrypt.compare(testPassword, user.password_hash)
    console.log('Comparison result:', isValid)
    
    // Test with other potential passwords
    const alternativePasswords = ['admin123', 'Admin123', 'password', 'admin']
    console.log('\nTesting alternative passwords:')
    for (const pwd of alternativePasswords) {
      const result = await bcrypt.compare(pwd, user.password_hash)
      console.log(`${pwd}: ${result}`)
    }
    
  } else {
    console.log('❌ User not found')
  }
  
  await prisma.$disconnect()
}

debugAuth().catch(console.error)
