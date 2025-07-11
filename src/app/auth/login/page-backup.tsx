'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    console.log('Form submit handler called!')
    e.preventDefault()
    console.log('Event prevented, proceeding with login...')
    setIsLoading(true)
    setError('')

    try {
      console.log('Attempting login with:', email)
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      console.log('Login result:', result)

      if (result?.error) {
        console.error('Login error:', result.error)
        setError('Invalid email or password')
      } else if (result?.ok) {
        console.log('Login successful, redirecting to dashboard...')
        // Use window.location for immediate redirect
        window.location.href = '/dashboard'
        return // Don't set loading to false, let the redirect happen
      } else {
        setError('Login failed - please try again')
      }
    } catch (error) {
      console.error('Login exception:', error)
      setError('An error occurred during login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">AmicusOnline</h1>
          <h2 className="text-xl text-blue-100 mb-8">Case Management System</h2>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              onClick={(e) => {
                console.log('Sign In button clicked!')
                console.log('Form data:', { email, password: password ? '***' : 'empty' })
                console.log('isLoading:', isLoading)
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="text-center">
              <Link 
                href="/auth/forgot-password" 
                className="text-sm text-blue-600 hover:text-blue-500"
              >
                Forgot your password?
              </Link>
            </div>

            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Need an account?{' '}
                <Link href="/auth/register" className="text-blue-600 hover:text-blue-500">
                  Contact your administrator
                </Link>
              </p>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="text-xs text-gray-500 space-y-1">
              <p><strong>Demo Credentials:</strong></p>
              <p>Email: admin@amicusonline.com</p>
              <p>Password: AmicusAdmin2024!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
