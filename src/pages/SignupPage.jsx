import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authService } from '../services/auth';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    full_name: '',
    phone: '',
    city: '',
    country: '',
    role: 'user'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.signup(formData);
      navigate('/');
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: 'var(--color-surface-container-low)',
    color: 'var(--color-on-surface)',
    fontFamily: 'var(--font-family-body)'
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12" style={{ backgroundColor: 'var(--color-background)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        {/* Floating Container */}
        <div
          className="rounded-xl p-12"
          style={{
            backgroundColor: 'var(--color-surface-container-lowest)',
            boxShadow: '0 32px 64px rgba(0, 0, 0, 0.08)'
          }}
        >
          {/* Headline */}
          <h1
            className="text-5xl font-bold mb-3 tracking-tight"
            style={{
              fontFamily: 'var(--font-family-headline)',
              color: 'var(--color-on-surface)',
              letterSpacing: '-0.02em'
            }}
          >
            Create Account
          </h1>

          <p
            className="text-base mb-10"
            style={{
              fontFamily: 'var(--font-family-body)',
              color: 'var(--color-on-surface-variant)'
            }}
          >
            Join us to start booking amazing events
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

          <form onSubmit={handleSignup} className="space-y-6">
            {/* Grid for 2 columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="full_name"
                  className="block text-sm font-medium mb-3"
                  style={{
                    color: 'var(--color-on-surface)',
                    fontFamily: 'var(--font-family-label)'
                  }}
                >
                  Full Name
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={handleChange}
                  required
                  className="w-full px-6 py-4 rounded-lg transition-all duration-200 outline-none"
                  style={inputStyle}
                  onFocus={(e) => {
                    e.target.style.backgroundColor = 'var(--color-surface-container-lowest)';
                    e.target.style.boxShadow = '0 0 0 2px var(--color-secondary-container)';
                  }}
                  onBlur={(e) => {
                    e.target.style.backgroundColor = 'var(--color-surface-container-low)';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="John Doe"
                />
              </div>

              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-sm font-medium mb-3"
                  style={{
                    color: 'var(--color-on-surface)',
                    fontFamily: 'var(--font-family-label)'
                  }}
                >
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  className="w-full px-6 py-4 rounded-lg transition-all duration-200 outline-none"
                  style={inputStyle}
                  onFocus={(e) => {
                    e.target.style.backgroundColor = 'var(--color-surface-container-lowest)';
                    e.target.style.boxShadow = '0 0 0 2px var(--color-secondary-container)';
                  }}
                  onBlur={(e) => {
                    e.target.style.backgroundColor = 'var(--color-surface-container-low)';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="johndoe"
                />
              </div>

              {/* Email */}
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
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-6 py-4 rounded-lg transition-all duration-200 outline-none"
                  style={inputStyle}
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

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium mb-3"
                  style={{
                    color: 'var(--color-on-surface)',
                    fontFamily: 'var(--font-family-label)'
                  }}
                >
                  Phone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-6 py-4 rounded-lg transition-all duration-200 outline-none"
                  style={inputStyle}
                  onFocus={(e) => {
                    e.target.style.backgroundColor = 'var(--color-surface-container-lowest)';
                    e.target.style.boxShadow = '0 0 0 2px var(--color-secondary-container)';
                  }}
                  onBlur={(e) => {
                    e.target.style.backgroundColor = 'var(--color-surface-container-low)';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="+919876543210"
                />
              </div>

              {/* City */}
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium mb-3"
                  style={{
                    color: 'var(--color-on-surface)',
                    fontFamily: 'var(--font-family-label)'
                  }}
                >
                  City
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full px-6 py-4 rounded-lg transition-all duration-200 outline-none"
                  style={inputStyle}
                  onFocus={(e) => {
                    e.target.style.backgroundColor = 'var(--color-surface-container-lowest)';
                    e.target.style.boxShadow = '0 0 0 2px var(--color-secondary-container)';
                  }}
                  onBlur={(e) => {
                    e.target.style.backgroundColor = 'var(--color-surface-container-low)';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="Mumbai"
                />
              </div>

              {/* Country */}
              <div>
                <label
                  htmlFor="country"
                  className="block text-sm font-medium mb-3"
                  style={{
                    color: 'var(--color-on-surface)',
                    fontFamily: 'var(--font-family-label)'
                  }}
                >
                  Country
                </label>
                <input
                  id="country"
                  name="country"
                  type="text"
                  value={formData.country}
                  onChange={handleChange}
                  required
                  className="w-full px-6 py-4 rounded-lg transition-all duration-200 outline-none"
                  style={inputStyle}
                  onFocus={(e) => {
                    e.target.style.backgroundColor = 'var(--color-surface-container-lowest)';
                    e.target.style.boxShadow = '0 0 0 2px var(--color-secondary-container)';
                  }}
                  onBlur={(e) => {
                    e.target.style.backgroundColor = 'var(--color-surface-container-low)';
                    e.target.style.boxShadow = 'none';
                  }}
                  placeholder="India"
                />
              </div>
            </div>

            {/* Password */}
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
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-6 py-4 rounded-lg transition-all duration-200 outline-none"
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.backgroundColor = 'var(--color-surface-container-lowest)';
                  e.target.style.boxShadow = '0 0 0 2px var(--color-secondary-container)';
                }}
                onBlur={(e) => {
                  e.target.style.backgroundColor = 'var(--color-surface-container-low)';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder="Create a secure password"
              />
            </div>

            {/* Role Selection */}
            <div>
              <label
                className="block text-sm font-medium mb-3"
                style={{
                  color: 'var(--color-on-surface)',
                  fontFamily: 'var(--font-family-label)'
                }}
              >
                I want to
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'user' })}
                  className="flex-1 py-4 px-6 rounded-full transition-all duration-200"
                  style={{
                    backgroundColor: formData.role === 'user' ? 'var(--color-secondary-container)' : 'var(--color-surface-container-low)',
                    color: formData.role === 'user' ? 'var(--color-on-secondary-fixed)' : 'var(--color-on-surface-variant)',
                    fontFamily: 'var(--font-family-label)',
                    fontWeight: formData.role === 'user' ? '600' : '400'
                  }}
                >
                  Book Events
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'organizer' })}
                  className="flex-1 py-4 px-6 rounded-full transition-all duration-200"
                  style={{
                    backgroundColor: formData.role === 'organizer' ? 'var(--color-secondary-container)' : 'var(--color-surface-container-low)',
                    color: formData.role === 'organizer' ? 'var(--color-on-secondary-fixed)' : 'var(--color-on-surface-variant)',
                    fontFamily: 'var(--font-family-label)',
                    fontWeight: formData.role === 'organizer' ? '600' : '400'
                  }}
                >
                  Organize Events
                </button>
              </div>
            </div>

            {/* Submit Button */}
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
              {loading ? 'Creating Account...' : (
                <>
                  Create Account
                  <span className="text-lg">→</span>
                </>
              )}
            </button>
          </form>

          {/* Login link */}
          <div className="mt-8 text-center">
            <p
              className="text-sm"
              style={{
                color: 'var(--color-on-surface-variant)',
                fontFamily: 'var(--font-family-body)'
              }}
            >
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium transition-colors"
                style={{ color: 'var(--color-secondary)' }}
                onMouseEnter={(e) => {
                  e.target.style.color = 'var(--color-on-secondary-container)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = 'var(--color-secondary)';
                }}
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
