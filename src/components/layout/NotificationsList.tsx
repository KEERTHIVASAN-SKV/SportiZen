import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, BellOff, CheckCheck } from 'lucide-react';
import { Notification } from '../../types';
import { notificationService } from '../../services/supabaseService';
import { supabase } from '../../lib/supabase';
import SkeletonCard from '../ui/SkeletonCard';

const typeEmoji: Record<string, string> = {
  connection_request: '🤝',
  connection_accepted: '✅',
  event_registration: '📅',
  verification_status: '🎖️',
  like: '❤️',
  comment: '💬',
};

const NotificationsList: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const data = await notificationService.getForUser(user.id);
    setNotifications(data);
    setLoading(false);
    // Mark all read
    await notificationService.markAllRead(user.id);
  }, [user]);

  useEffect(() => {
    loadNotifications();

    if (!user) return;
    const channel = supabase
      .channel(`notifications-list-${user.id}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'notifications',
        filter: `user_id=eq.${user.id}`,
      }, () => loadNotifications())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, loadNotifications]);

  const timeAgo = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white flex items-center gap-3">
          <Bell className="w-7 h-7 text-orange-500" />
          Notifications
        </h1>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          {notifications.filter((n) => !n.isRead).length} unread
        </span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 skeleton rounded-xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="empty-state py-16">
          <BellOff className="w-12 h-12 text-gray-300" />
          <h3 className="text-lg font-bold text-gray-400">No notifications yet</h3>
          <p className="text-gray-400 text-sm">You'll be notified when something happens.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`flex items-start gap-4 p-4 rounded-2xl transition-all border ${
                !notif.isRead
                  ? 'bg-blue-50 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900'
                  : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 opacity-80'
              }`}
            >
              <div className="text-2xl flex-shrink-0">{typeEmoji[notif.type] || '🔔'}</div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-800 dark:text-white text-sm">{notif.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{notif.message}</p>
                <p className="text-[10px] text-gray-400 mt-1 font-semibold">{timeAgo(notif.createdAt)}</p>
              </div>
              {!notif.isRead && (
                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsList;
