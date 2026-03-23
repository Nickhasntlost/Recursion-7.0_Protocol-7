import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../services/auth';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(email, password);
      navigate('/');
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12" style={{ backgroundColor: 'var(--color-background)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Floating Container - Glassmorphism */}
        <div
          className="rounded-xl p-12"
          style={{
            backgroundColor: 'var(--color-surface-container-lowest)',
            boxShadow: '0 32px 64px rgba(0, 0, 0, 0.08)'
          }}
        >
          {/* Headline - Plus Jakarta Sans */}
          <h1
            className="text-5xl font-bold mb-3 tracking-tight"
            style={{
              fontFamily: 'var(--font-family-headline)',
              color: 'var(--color-on-surface)',
              letterSpacing: '-0.02em'
            }}
          >
            Welcome Back
          </h1>

          <p
            className="text-base mb-10"
            style={{
              fontFamily: 'var(--font-family-body)',
              color: 'var(--color-on-surface-variant)'
            }}
          >
            Sign in to continue to your account
          </p>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 px-6 py-4 rounded-full"
              style={{
                backgroundColor: 'var(--color-error-container)',
                color: 'var(--color-on-error-container)'
              }}
            >
              <p className="text-sm">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input - No border, surface-container-low background */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium mb-3"
                style={{
                  color: 'var(--color-on-surface)',
                  fontFamily: 'var(--font-family-label)'
                }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-6 py-4 rounded-lg transition-all duration-200 outline-none"
                style={{
                  backgroundColor: 'var(--color-surface-container-low)',
                  color: 'var(--color-on-surface)',
                  fontFamily: 'var(--font-family-body)'
                }}
                onFocus={(e) => {
                  e.target.style.backgroundColor = 'var(--color-surface-container-lowest)';
                  e.target.style.boxShadow = '0 0 0 2px var(--color-secondary-container)';
                }}
                onBlur={(e) => {
                  e.target.style.backgroundColor = 'var(--color-surface-container-low)';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="your@email.com"
              />
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium mb-3"
                style={{
                  color: 'var(--color-on-surface)',
                  fontFamily: 'var(--font-family-label)'
                }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-6 py-4 rounded-lg transition-all duration-200 outline-none"
                style={{
                  backgroundColor: 'var(--color-surface-container-low)',
                  color: 'var(--color-on-surface)',
                  fontFamily: 'var(--font-family-body)'
                }}
                onFocus={(e) => {
                  e.target.style.backgroundColor = 'var(--color-surface-container-lowest)';
                  e.target.style.boxShadow = '0 0 0 2px var(--color-secondary-container)';
                }}
                onBlur={(e) => {
                  e.target.style.backgroundColor = 'var(--color-surface-container-low)';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Enter your password"
              />
            </div>

            {/* Primary Button - Full rounded with gradient */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-8 rounded-full font-medium text-base transition-all duration-200 flex items-center justify-center gap-2"
              style={{
                background: loading
                  ? 'var(--color-surface-container-high)'
                  : 'linear-gradient(to right, var(--color-primary), var(--color-primary-container))',
                color: loading ? 'var(--color-on-surface-variant)' : 'var(--color-on-primary)',
                fontFamily: 'var(--font-family-label)',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.12)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              {loading ? 'Signing in...' : (
                <>
                  Sign In
                  <span className="text-lg">→</span>
                </>
              )}
            </button>
          </form>

          {/* Sign up link */}
          <div className="mt-8 text-center">
            <p
              className="text-sm"
              style={{
                color: 'var(--color-on-surface-variant)',
                fontFamily: 'var(--font-family-body)'
              }}
            >
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-medium transition-colors"
                style={{ color: 'var(--color-secondary)' }}
                onMouseEnter={(e) => {
                  e.target.style.color = 'var(--color-on-secondary-container)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'var(--color-secondary)';
                }}
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
