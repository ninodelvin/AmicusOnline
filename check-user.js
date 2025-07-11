const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'admin@amicusonline.com' },
      include: { role: true }
    })
    
    if (user) {
      console.log('User found:')
      console.log('Email:', user.email)
      console.log('Name:', user.first_name, user.last_name)
      console.log('Role:', user.role.role_name)
      console.log('Active:', user.is_active)
      console.log('Failed attempts:', user.failed_login_attempts)
      console.log('Account locked until:', user.account_locked_until)
    } else {
      console.log('User not found!')
    }
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUser()
