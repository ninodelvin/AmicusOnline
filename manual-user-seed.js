const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('Creating users...')
  
  // Create test users
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  const users = [
    {
      email: 'admin@amicusonline.com',
      password_hash: hashedPassword,
      first_name: 'Admin',
      last_name: 'User',
      role: 'SuperAdmin',
      is_active: true
    },
    {
      email: 'attorney@amicusonline.com',
      password_hash: hashedPassword,
      first_name: 'John',
      last_name: 'Attorney',
      role: 'Attorney',
      is_active: true
    },
    {
      email: 'paralegal@amicusonline.com',
      password_hash: hashedPassword,
      first_name: 'Jane',
      last_name: 'Paralegal',
      role: 'Paralegal',
      is_active: true
    }
  ]
  
  for (const user of users) {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email }
      })
      
      if (!existingUser) {
        await prisma.user.create({ data: user })
        console.log(`Created user: ${user.email}`)
      } else {
        console.log(`User already exists: ${user.email}`)
      }
    } catch (error) {
      console.error(`Error creating user ${user.email}:`, error)
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
