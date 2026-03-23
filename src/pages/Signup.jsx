import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'

const Signup = () => {
  const navigate = useNavigate()
  const [userType, setUserType] = useState('client')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all fields')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    toast.success('Account created successfully!')
    setTimeout(() => {
      navigate('/')
    }, 1000)
  }

  const handleOAuthSignup = (provider) => {
    toast.success(`Redirecting to ₹{provider} signup...`)
    setTimeout(() => {
      navigate('/')
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <Link to="/" className="text-4xl font-black tracking-tighter text-black uppercase font-headline">
            ASSEMBLE
          </Link>
          <p className="text-on-surface-variant mt-4 text-lg">Create your curated experience</p>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
          <h1 className="text-3xl font-black font-headline mb-8">Sign Up</h1>

          {/* User Type Selection */}
          <div className="mb-8">
            <p className="text-sm font-semibold mb-3">I am a:</p>
            <div className="flex gap-4">
              <button
                onClick={() => setUserType('client')}
                className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all ₹{
                  userType === 'client'
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-low hover:bg-surface-container-high'
                }`}
              >
                Event Attendee
              </button>
              <button
                onClick={() => setUserType('organizer')}
                className={`flex-1 py-3 px-4 rounded-lg font-bold text-sm transition-all ₹{
                  userType === 'organizer'
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-container-low hover:bg-surface-container-high'
                }`}
              >
                Event Organizer
              </button>
            </div>
          </div>

          {/* OAuth Buttons */}
          <div className="space-y-4 mb-8">
            <button
              onClick={() => handleOAuthSignup('Google')}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white border border-outline-variant rounded-full font-bold hover:bg-surface-container-low transition-all"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            <button
              onClick={() => handleOAuthSignup('GitHub')}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-black text-white border border-black rounded-full font-bold hover:opacity-90 transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              Continue with GitHub
            </button>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-container"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-surface-container-lowest text-on-surface-variant">Or continue with email</span>
            </div>
          </div>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-semibold ml-4">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                className="w-full bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-secondary-container focus:bg-surface-container-lowest transition-all"
                placeholder="Alex Rivera"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold ml-4">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                className="w-full bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-secondary-container focus:bg-surface-container-lowest transition-all"
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold ml-4">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                className="w-full bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-secondary-container focus:bg-surface-container-lowest transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold ml-4">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                className="w-full bg-surface-container-low border-none rounded-lg p-4 focus:ring-2 focus:ring-secondary-container focus:bg-surface-container-lowest transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-on-primary py-4 rounded-full font-bold text-lg hover:scale-[0.98] transition-all"
            >
              Create Account
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-on-surface-variant">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>

        <button
          onClick={() => navigate('/')}
          className="flex items-center justify-center gap-2 mx-auto mt-8 text-on-surface-variant hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          <span>Back to Home</span>
        </button>
      </div>
    </div>
  )
}

export default Signup
