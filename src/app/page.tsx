import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            AmicusOnline
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-6 max-w-3xl mx-auto">
            Enterprise Case Management System for Legal Professionals
          </p>
          <p className="text-base md:text-lg text-blue-200 mb-8 max-w-2xl mx-auto">
            Streamline your case management with role-based access control, 
            document workflow management, and enterprise-grade security.
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/auth/login" className="inline-block">
              <button className="h-10 px-6 text-sm bg-white text-blue-900 hover:bg-gray-100 font-medium rounded-md transition-colors">
                Sign In
              </button>
            </Link>
            <Link href="/auth/register" className="inline-block">
              <button className="h-10 px-6 text-sm border border-white text-white hover:bg-white hover:text-blue-900 font-medium rounded-md transition-colors">
                Create Account
              </button>
            </Link>
          </div>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
            <h3 className="text-xl font-semibold mb-3">Role-Based Access</h3>
            <p className="text-blue-100">
              SuperAdmins, Admins, Attorneys, and Paralegals each have 
              appropriate access levels to maintain security and efficiency.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
            <h3 className="text-xl font-semibold mb-3">Document Workflow</h3>
            <p className="text-blue-100">
              Comprehensive document management with task assignment, 
              priority levels, and status tracking for optimal workflow.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 text-white">
            <h3 className="text-xl font-semibold mb-3">Enterprise Security</h3>
            <p className="text-blue-100">
              Advanced security features including password policies, 
              account lockout protection, and secure password reset functionality.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
