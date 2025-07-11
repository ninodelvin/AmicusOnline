// Test Users API endpoint
async function testUsersAPI() {
  console.log('🧪 Testing Users API Endpoint')
  console.log('==============================')
  
  try {
    const response = await fetch('http://localhost:3000/api/users', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    console.log(`Status: ${response.status}`)
    
    if (response.ok) {
      const data = await response.json()
      console.log(`✅ API Response received`)
      console.log(`Number of users: ${data.users?.length || 0}`)
      
      if (data.users) {
        console.log('\n👥 Users from API:')
        data.users.forEach((user, index) => {
          console.log(`${index + 1}. ${user.first_name} ${user.last_name} (${user.role_name})`)
          console.log(`   Email: ${user.email}`)
          console.log(`   Created: ${new Date(user.created_at).toLocaleDateString()}`)
          console.log(`   Last Login: ${user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}`)
          console.log('---')
        })
      }
    } else {
      const errorText = await response.text()
      console.log(`❌ API Error: ${errorText}`)
    }
    
  } catch (error) {
    console.error('❌ Network error:', error.message)
  }
}

// Test immediately
testUsersAPI()
