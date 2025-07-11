// Set DATABASE_URL environment variable directly
process.env.DATABASE_URL = "file:./dev.db"

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function addMoreUsers() {
  console.log('👥 Adding More Users for Testing')
  console.log('=================================')
  
  try {
    const newUsers = [
      {
        first_name: 'Sarah',
        last_name: 'Admin',
        email: 'sarah.admin@amicusonline.com',
        role_id: 2, // Admin
      },
      {
        first_name: 'Michael',
        last_name: 'Attorney',
        email: 'michael.attorney@amicusonline.com',
        role_id: 3, // Attorney
      },
      {
        first_name: 'Lisa',
        last_name: 'Attorney',
        email: 'lisa.attorney@amicusonline.com',
        role_id: 3, // Attorney
      },
      {
        first_name: 'David',
        last_name: 'Paralegal',
        email: 'david.paralegal@amicusonline.com',
        role_id: 4, // Paralegal
      },
      {
        first_name: 'Emma',
        last_name: 'Paralegal',
        email: 'emma.paralegal@amicusonline.com',
        role_id: 4, // Paralegal
      }
    ]

    for (const user of newUsers) {
      // Check if user already exists
      const existingUser = await prisma.$queryRaw`
        SELECT id FROM users WHERE email = ${user.email}
      `
      
      if (existingUser.length > 0) {
        console.log(`⚠️  User ${user.email} already exists, skipping...`)
        continue
      }

      // Hash password (using same password for all test users)
      const passwordHash = await bcrypt.hash('password123', 10)
      
      // Insert new user
      await prisma.$executeRaw`
        INSERT INTO users (
          first_name, last_name, email, password_hash, role_id, 
          is_active, created_at, updated_at
        ) VALUES (
          ${user.first_name}, ${user.last_name}, ${user.email}, ${passwordHash}, ${user.role_id},
          1, ${new Date()}, ${new Date()}
        )
      `
      
      console.log(`✅ Added user: ${user.first_name} ${user.last_name} (${user.email})`)
    }

    // Show updated user list
    console.log('\n📋 Updated User List:')
    const allUsers = await prisma.$queryRaw`
      SELECT u.id, u.first_name, u.last_name, u.email, ur.role_name
      FROM users u
      LEFT JOIN user_roles ur ON u.role_id = ur.id
      ORDER BY ur.id, u.id
    `
    
    allUsers.forEach(user => {
      console.log(`${user.role_name}: ${user.first_name} ${user.last_name} (${user.email})`)
    })
    
    console.log(`\nTotal Users: ${allUsers.length}`)
    console.log('\n🔑 All users can login with password: password123')

  } catch (error) {
    console.error('❌ Error adding users:', error)
  }
  
  await prisma.$disconnect()
}

addMoreUsers().catch(console.error)
