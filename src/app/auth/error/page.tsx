'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.'
      case 'AccessDenied':
        return 'Access denied. You do not have permission to sign in.'
      case 'Verification':
        return 'The verification token has expired or has already been used.'
      case 'Default':
      default:
        return 'An error occurred during authentication. Please try again.'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">AmicusOnline</h1>
          <h2 className="text-xl text-blue-100 mb-8">Authentication Error</h2>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Authentication Failed
            </h3>
            
            <p className="text-sm text-gray-600 mb-6">
              {getErrorMessage(error)}
            </p>

            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/auth/login">
                  Try Again
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full">
                <Link href="/">
                  Return Home
                </Link>
              </Button>
            </div>

            {error && (
              <div className="mt-6 p-3 bg-gray-50 rounded-md">
                <p className="text-xs text-gray-500">
                  Error code: {error}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
