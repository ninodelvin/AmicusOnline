'use client'

import { signOut } from 'next-auth/react'

export default function SignOutButton() {
  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/login' })
  }

  return (
    <button 
      onClick={handleSignOut}
      className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
    >
      Sign Out
    </button>
  )
}
