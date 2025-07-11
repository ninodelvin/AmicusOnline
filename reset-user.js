const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function resetUser() {
  await prisma.$executeRaw`
    UPDATE users 
    SET failed_login_attempts = 0, account_locked_until = NULL
    WHERE email = 'admin@amicusonline.com'
  `
  
  console.log('Reset user failed login attempts')
  
  await prisma.$disconnect()
}

resetUser().catch(console.error)
