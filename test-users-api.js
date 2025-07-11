// Set DATABASE_URL environment variable directly
process.env.DATABASE_URL = "file:./dev.db"

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function testUsersAPI() {
  console.log('🧪 Testing Users API')
  console.log('====================')
  
  try {
    // Test the same query that the API uses
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
    
    console.log(`Found ${users.length} active users:`)
    console.log('-----------------------------------')
    
    users.forEach(user => {
      console.log(`${user.role_name}: ${user.first_name} ${user.last_name} (${user.email})`)
      console.log(`  Last Login: ${user.last_login || 'Never'}`)
      console.log(`  Created: ${user.created_at}`)
      console.log('---')
    })
    
    console.log('✅ Users API data is ready!')
    
  } catch (error) {
    console.error('❌ Error testing users API:', error)
  }
  
  await prisma.$disconnect()
}

testUsersAPI().catch(console.error)
