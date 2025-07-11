const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function testAuth() {
  const testPassword = 'password123'
  
  // Get the stored hash for admin user
  const users = await prisma.$queryRaw`
    SELECT password_hash FROM users WHERE email = 'admin@amicusonline.com'
  `
  
  if (users.length > 0) {
    const storedHash = users[0].password_hash
    console.log('Stored hash:', storedHash)
    
    // Test the comparison
    const isValid = await bcrypt.compare(testPassword, storedHash)
    console.log('Password comparison result:', isValid)
    
    // Create a new hash for comparison
    const newHash = await bcrypt.hash(testPassword, 10)
    console.log('New hash:', newHash)
    
    const isNewValid = await bcrypt.compare(testPassword, newHash)
    console.log('New hash comparison result:', isNewValid)
  } else {
    console.log('User not found')
  }
  
  await prisma.$disconnect()
}

testAuth().catch(console.error)
