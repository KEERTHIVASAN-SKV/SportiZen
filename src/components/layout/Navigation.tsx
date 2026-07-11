import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Trophy, Home, User, Users, Search, Bell, Sun, Moon, LogOut,
  Calendar, ShieldCheck, Zap, Plus, X, LayoutDashboard, ChevronDown,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Avatar from '../ui/Avatar';

const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  // Scroll effect
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Real-time notification count
  const fetchUnread = useCallback(async () => {
    if (!user) return;
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);
    setUnreadCount(count || 0);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchUnread();

    // Realtime subscription
    const channel = supabase
      .channel(`notif-nav-${user.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        () => fetchUnread()
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        () => fetchUnread()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, fetchUnread]);

  if (!user) return null;

  const handleNotifications = () => {
    navigate('/notifications');
  };

  // Role-based nav items
  const getNavItems = () => {
    const common = [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/feed', icon: Zap, label: 'Feed' },
    ];

    if (user.role === 'player') {
      return [
        ...common,
        { path: '/events', icon: Calendar, label: 'Events' },
        { path: '/search', icon: Search, label: 'Coaches' },
        { path: '/verification', icon: ShieldCheck, label: 'Verify' },
      ];
    } else if (user.role === 'coach') {
      return [
        ...common,
        { path: '/search', icon: Users, label: 'Athletes' },
      ];
    } else {
      return [
        ...common,
        { path: '/events', icon: Calendar, label: 'Events' },
        { path: '/search', icon: Users, label: 'Athletes' },
        { path: '/verification', icon: ShieldCheck, label: 'Verify' },
      ];
    }
  };

  const navItems = getNavItems();

  const roleBadgeColor = {
    player: 'from-blue-500 to-cyan-500',
    coach: 'from-emerald-500 to-teal-500',
    organization: 'from-orange-500 to-amber-500',
  }[user.role] || 'from-blue-500 to-cyan-500';

  return (
    <>
      {/* Desktop Navigation */}
      <nav
        className={`sticky top-0 z-50 transition-all duration-300 nav-blur ${
          scrolled
            ? 'bg-white/95 dark:bg-gray-900/95 shadow-lg shadow-black/5 border-b border-gray-200/60 dark:border-gray-700/60'
            : 'bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/40 dark:border-gray-700/40'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div
              className="flex items-center gap-2.5 cursor-pointer group"
              onClick={() => navigate('/dashboard')}
            >
              <div className={`bg-gradient-to-br ${roleBadgeColor} p-2 rounded-xl shadow-lg group-hover:scale-105 transition-transform`}>
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-xl font-black bg-gradient-to-r from-blue-600 to-teal-500 dark:from-blue-400 dark:to-teal-400 bg-clip-text text-transparent">
                  SportiZen
                </span>
              </div>
            </div>

            {/* Desktop Nav Items */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25'
                      : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/20'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  {item.label}
                </button>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <button
                onClick={handleNotifications}
                className={`relative p-2.5 rounded-xl border transition-all duration-200 ${
                  isActive('/notifications')
                    ? 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800 text-orange-500'
                    : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-orange-300 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20'
                }`}
              >
                <Bell className="w-4.5 h-4.5 w-[18px] h-[18px]" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[9px] font-black min-w-[18px] h-[18px] rounded-full flex items-center justify-center shadow-sm animate-bounce">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-blue-500 hover:border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-all duration-200"
              >
                {isDarkMode
                  ? <Sun className="w-[18px] h-[18px] text-yellow-400" />
                  : <Moon className="w-[18px] h-[18px]" />
                }
              </button>

              {/* Profile Dropdown */}
              <div
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 group"
                onClick={() => navigate('/profile')}
              >
                <Avatar src={user.profilePicture} name={user.name} size="xs" role={user.role} />
                <div className="text-left">
                  <p className="text-xs font-black text-gray-800 dark:text-white leading-none">{user.name}</p>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">{user.role}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600" />
              </div>

              {/* Mobile Avatar */}
              <div
                className="lg:hidden cursor-pointer"
                onClick={() => navigate('/profile')}
              >
                <Avatar src={user.profilePicture} name={user.name} size="sm" role={user.role} />
              </div>

              {/* Logout */}
              <button
                onClick={logout}
                className="p-2.5 text-gray-500 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 border border-gray-200 dark:border-gray-700 transition-all duration-200"
                title="Logout"
              >
                <LogOut className="w-[18px] h-[18px]" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden bottom-nav bg-white/95 dark:bg-gray-900/95 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.slice(0, 4).map((item) => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 ${
                isActive(item.path)
                  ? 'text-blue-500'
                  : 'text-gray-400 hover:text-blue-500'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'scale-110' : ''} transition-transform`} />
              <span className="text-[9px] font-bold">{item.label}</span>
            </button>
          ))}

          {/* Notifications */}
          <button
            onClick={handleNotifications}
            className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all ${
              isActive('/notifications') ? 'text-orange-500' : 'text-gray-400'
            }`}
          >
            <Bell className="w-5 h-5" />
            <span className="text-[9px] font-bold">Alerts</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-2 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* Extra bottom padding for notch/home bar */}
        <div className="h-safe-area-inset-bottom" />
      </div>

      {/* Mobile spacer */}
      <div className="md:hidden h-[72px]" />
    </>
  );
};

export default Navigation;