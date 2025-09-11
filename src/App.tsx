import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AuthPage from './components/auth/AuthPage';
import Navigation from './components/layout/Navigation';
import Dashboard from './components/dashboard/Dashboard';
import ProfilePage from './components/profile/ProfilePage';
import SearchPage from './components/search/SearchPage';
import Feed from './components/feed/Feed';
import AchievementsPage from './components/achievements/AchievementsPage'; // NEW
import AnimatedBackground from './components/AnimatedBackground';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!user) {
    return <AuthPage />;
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'profile':
        return <ProfilePage />;
      case 'achievements': // NEW
        return <AchievementsPage />;
      case 'search':
        return <SearchPage />;
      case 'connections':
        return <Feed />;
      case 'messages':
        return <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Messages</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Coming soon!</p>
        </div>;
      case 'notifications':
        return <div className="max-w-7xl mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Notifications</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Coming soon!</p>
        </div>;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <AnimatedBackground />
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="relative z-10">
        {renderActiveTab()}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;