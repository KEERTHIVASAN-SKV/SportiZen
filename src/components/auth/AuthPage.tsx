import React, { useState } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import AnimatedBackground from '../AnimatedBackground';
import { Trophy } from 'lucide-react';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <AnimatedBackground />
      
      <div className="w-full max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Branding */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center mb-8">
              <div className="bg-blue-500 p-3 rounded-2xl mr-4">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-gray-800 dark:text-white">SportiZen</h1>
            </div>
            
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-800 dark:text-white mb-6">
              The Professional Network for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-green-500">
                Athletes
              </span>
            </h2>
            
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Connect with fellow athletes, showcase your achievements, and build your professional sports network.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">🏆 Showcase Achievements</span>
              </div>
              <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">🤝 Connect with Athletes</span>
              </div>
              <div className="bg-white dark:bg-gray-800 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-600 dark:text-gray-400">📈 Track Progress</span>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Forms */}
          <div>
            {isLogin ? (
              <LoginForm onSwitchToSignup={() => setIsLogin(false)} />
            ) : (
              <SignupForm onSwitchToLogin={() => setIsLogin(true)} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;