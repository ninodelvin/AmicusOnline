'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('=== FORM SUBMIT TRIGGERED ===')
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log('Login attempt with:', email)
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      console.log('SignIn result:', result)

      if (result?.error) {
        setError('Invalid email or password')
      } else if (result?.ok) {
        console.log('Login successful - redirecting...')
        window.location.href = '/dashboard'
        return
      } else {
        setError('Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleButtonClick = () => {
    console.log('=== BUTTON CLICKED ===')
    console.log('Current state:', { email, password: password ? 'filled' : 'empty', isLoading })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center px-4">
      <div className="w-full max-w-sm mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">AmicusOnline</h1>
          <h2 className="text-lg text-blue-100">Case Management System</h2>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              onClick={handleButtonClick}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:opacity-50 text-sm"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="text-center">
              <Link 
                href="/"
                className="text-xs text-blue-600 hover:text-blue-500"
              >
                Back to Home
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
