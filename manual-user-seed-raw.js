const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Creating users with raw SQL...')
  
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const users = [
    ['admin@amicusonline.com', hashedPassword, 'Admin', 'User', 'SuperAdmin'],
    ['attorney@amicusonline.com', hashedPassword, 'John', 'Attorney', 'Attorney'],
    ['paralegal@amicusonline.com', hashedPassword, 'Jane', 'Paralegal', 'Paralegal']
  ]
  
  for (const [email, password_hash, first_name, last_name, role] of users) {
    try {
      // Check if user exists
      const existing = await prisma.$queryRaw`SELECT * FROM users WHERE email = ${email}`
      
      if (existing.length === 0) {
        await prisma.$executeRaw`
          INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, created_at, updated_at)
          VALUES (${email}, ${password_hash}, ${first_name}, ${last_name}, ${role}, 1, ${new Date()}, ${new Date()})
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
