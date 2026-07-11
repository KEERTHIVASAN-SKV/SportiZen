import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { UserPlus, Eye, EyeOff, Trophy, Award, Building2 } from 'lucide-react';
import { SPORTS_CATEGORIES } from '../../types';

interface SignupFormProps {
  onSwitchToLogin: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSwitchToLogin }) => {
  const [role, setRole] = useState<'player' | 'coach' | 'organization'>('player');
  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    sport: '',
    location: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const signupPayload = {
      ...formData,
      role,
      // For organizations, default sport to 'Other' if not selected
      sport: role === 'organization' ? 'Other' : formData.sport,
    };

    const result = await signup(signupPayload);
    if (!result.success) {
      setError(result.error || 'Username or email already exists. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-green-400 to-blue-500 rounded-2xl mb-4 shadow-lg shadow-green-500/20">
            <UserPlus className="w-8 h-8 text-white animate-pulse" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white tracking-tight">Join SportiZen</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">Create your digital sports identity</p>
        </div>

        {/* Role Selector Card Grid */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 text-center">
            Select Your User Role
          </label>
          <div className="grid grid-cols-3 gap-3">
            {/* Player Card */}
            <button
              type="button"
              onClick={() => setRole('player')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                role === 'player'
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-md'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Trophy className={`w-6 h-6 mb-1 ${role === 'player' ? 'text-blue-500' : 'text-gray-400'}`} />
              <span className="text-xs font-bold font-sans">Player</span>
            </button>

            {/* Coach Card */}
            <button
              type="button"
              onClick={() => setRole('coach')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                role === 'coach'
                  ? 'border-green-500 bg-green-50/50 dark:bg-green-900/20 text-green-600 dark:text-green-400 shadow-md'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Award className={`w-6 h-6 mb-1 ${role === 'coach' ? 'text-green-500' : 'text-gray-400'}`} />
              <span className="text-xs font-bold font-sans">Coach</span>
            </button>

            {/* Org Card */}
            <button
              type="button"
              onClick={() => setRole('organization')}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all duration-300 transform hover:scale-105 ${
                role === 'organization'
                  ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 shadow-md'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <Building2 className={`w-6 h-6 mb-1 ${role === 'organization' ? 'text-orange-500' : 'text-gray-400'}`} />
              <span className="text-xs font-bold font-sans">Academy</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                placeholder="e.g. jdoe12"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                {role === 'organization' ? 'Organization Name' : 'Full Name'}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                placeholder={role === 'organization' ? 'Elite Sports Academy' : 'John Doe'}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
              placeholder="name@example.com"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {role !== 'organization' ? (
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  Sport
                </label>
                <select
                  name="sport"
                  value={formData.sport}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                  required
                >
                  <option value="">Select Sport</option>
                  {SPORTS_CATEGORIES.map(sport => (
                    <option key={sport} value={sport}>{sport}</option>
                  ))}
                </select>
              </div>
            ) : null}
            <div className={role === 'organization' ? 'col-span-2' : ''}>
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                placeholder={role === 'organization' ? 'City, State or Full Address' : 'New York, NY'}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
              Confirm Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-3 py-2 rounded-lg text-xs font-sans">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 transform hover:scale-102 disabled:opacity-50 disabled:transform-none shadow-md ${
              role === 'player' 
                ? 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/10' 
                : role === 'coach'
                  ? 'bg-green-500 hover:bg-green-600 shadow-green-500/10'
                  : 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/10'
            }`}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className={`font-semibold transition-colors duration-200 ${
                role === 'player' 
                  ? 'text-blue-500 hover:text-blue-600' 
                  : role === 'coach'
                    ? 'text-green-500 hover:text-green-600'
                    : 'text-orange-500 hover:text-orange-600'
              }`}
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;