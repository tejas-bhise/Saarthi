import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signup, login } from '../utils/api';
import { ParticleBackground } from '../components/ParticleBackground';

export const AuthPage = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
        console.log('✅ Login successful');
        navigate('/dashboard', { replace: true });
      } else {
        if (!formData.name.trim()) {
          setError('Name is required');
          setLoading(false);
          return;
        }
        await signup(formData.email, formData.password, formData.name);
        console.log('✅ Signup successful');
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      console.error('❌ Auth error:', err);
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ email: '', password: '', name: '' });
  };

  return (
    <div className="relative min-h-screen bg-slate-800 text-slate-100 overflow-hidden flex items-center justify-center">
      <ParticleBackground />

      <div className="relative z-10 w-full max-w-md px-4 sm:px-6">
        {/* Logo / Brand - Added space before Saarthi, removed tagline */}
        <div className="text-center mb-10">
          <div className="w-20 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent mx-auto mb-4" />
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-200">
            Saarthi
          </h1>
        </div>

        {/* Compact White Auth Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-7 shadow-2xl shadow-slate-200/50">
          {/* Tab Switcher */}
          <div className="flex mb-5 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg transition-all ${
                isLogin
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-300'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-3 px-4 text-sm font-semibold rounded-lg transition-all ${
                !isLogin
                  ? 'bg-white text-slate-900 shadow-sm border border-slate-300'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
              }`}
            >
              Sign up
            </button>
          </div>

          {/* Title under tabs - Reduced margin */}
          <div className="mb-4">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {isLogin ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {isLogin
                ? 'Enter your credentials to continue learning.'
                : 'It only takes a minute to get started.'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            {!isLogin && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate-700 mb-2"
                >
                  Full name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  required={!isLogin}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition"
                />
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition"
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 mb-2"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
                minLength={6}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400 transition"
              />
              <p className="mt-1 text-xs text-slate-500">
                Minimum 6 characters
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800 flex items-start gap-2">
                <span className="mt-0.5 text-lg">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg bg-slate-700 text-sm font-semibold text-white shadow-lg shadow-slate-700/30 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-white disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>
                    {isLogin ? 'Logging in...' : 'Creating account...'}
                  </span>
                </span>
              ) : (
                <span>{isLogin ? 'Login' : 'Create account'}</span>
              )}
            </button>
          </form>

          {/* Toggle Link */}
          <div className="mt-5 text-center text-sm text-slate-600">
            {isLogin ? (
              <>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="font-semibold text-slate-700 hover:text-slate-900"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="font-semibold text-slate-700 hover:text-slate-900"
                >
                  Login
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
