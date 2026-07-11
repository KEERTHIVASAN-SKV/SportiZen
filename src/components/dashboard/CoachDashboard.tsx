import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Users, UserCheck, Star, Award, ShieldAlert, Check, X } from 'lucide-react';
import { connectionService } from '../../services/supabaseService';
import { Connection, User } from '../../types';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import Avatar from '../ui/Avatar';
import SkeletonCard from '../ui/SkeletonCard';

const CoachDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState<{ connection: Connection; profile: User }[]>([]);
  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [pending, accepted] = await Promise.all([
        connectionService.getPendingForUser(user.id),
        connectionService.getAcceptedForUser(user.id),
      ]);
      setPendingRequests(pending);
      setClients(accepted.filter((u) => u.role === 'player'));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();

    // Realtime: auto-refresh on new connections
    if (!user) return;
    const channel = supabase
      .channel(`coach-connections-${user.id}`)
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'connections',
        filter: `receiver_id=eq.${user.id}`,
      }, loadData)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, loadData]);

  const handleAction = async (connId: string, action: 'accept' | 'reject') => {
    const success = action === 'accept'
      ? await connectionService.accept(connId)
      : await connectionService.reject(connId);

    if (success) {
      toast.success(action === 'accept' ? 'Connection accepted!' : 'Request declined.');
      loadData();
    } else {
      toast.error('Action failed. Please try again.');
    }
  };

  if (!user) return null;

  const stats = [
    { label: 'Total Athletes', value: clients.length, icon: Users, color: 'text-green-500 bg-green-50 dark:bg-green-950/20' },
    { label: 'Pending Requests', value: pendingRequests.length, icon: ShieldAlert, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' },
    { label: 'Coach Rating', value: user.coachProfile?.rating || '5.0', icon: Star, color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950/20' },
    { label: 'Experience', value: user.coachProfile?.experience || '0 yrs', icon: Award, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white flex items-center gap-3">
          Coach Dashboard
          <span className="badge-coach">Coach</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Welcome, Coach <span className="font-black text-gray-800 dark:text-white">{user.name}</span>. Manage your athletes and coaching updates.
        </p>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <SkeletonCard type="stat" count={4} />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="stat-card">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">{stat.label}</span>
                <span className="text-2xl font-black text-gray-800 dark:text-white">{stat.value}</span>
              </div>
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending Requests */}
        <div className="lg:col-span-2">
          <div className="card-sports p-6">
            <h3 className="section-header">
              <UserCheck className="w-5 h-5 text-green-500" />
              Athlete Connection Requests
              {pendingRequests.length > 0 && (
                <span className="ml-auto px-2 py-0.5 bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-xs font-black rounded-full">
                  {pendingRequests.length} new
                </span>
              )}
            </h3>

            {loading ? (
              <div className="space-y-3">
                {[0, 1].map((i) => (
                  <div key={i} className="h-20 skeleton rounded-xl" />
                ))}
              </div>
            ) : pendingRequests.length === 0 ? (
              <div className="empty-state py-10">
                <UserCheck className="w-10 h-10 text-gray-300" />
                <p className="text-sm text-gray-400 font-medium">No pending requests at the moment.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map(({ connection, profile }) => (
                  <div
                    key={connection.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-sm transition-all"
                  >
                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => navigate(`/player/${profile.id}`)}
                    >
                      <Avatar src={profile.profilePicture} name={profile.name} size="md" role="player" />
                      <div>
                        <h4 className="font-bold text-gray-800 dark:text-white text-sm">{profile.name}</h4>
                        <p className="text-xs text-gray-400">@{profile.username} · {profile.sport}</p>
                        {profile.playerProfile?.position && (
                          <p className="text-xs text-blue-500 font-semibold">Position: {profile.playerProfile.position}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3 sm:mt-0">
                      <button onClick={() => handleAction(connection.id, 'accept')} className="btn-success flex items-center gap-1 text-xs">
                        <Check className="w-3.5 h-3.5" /> Accept
                      </button>
                      <button onClick={() => handleAction(connection.id, 'reject')} className="btn-danger flex items-center gap-1 text-xs">
                        <X className="w-3.5 h-3.5" /> Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Active Clients */}
        <div>
          <div className="card-sports p-6">
            <h3 className="section-header">
              <Users className="w-5 h-5 text-blue-500" />
              Active Athletes
            </h3>

            {clients.length === 0 ? (
              <div className="empty-state py-8">
                <Users className="w-8 h-8 text-gray-300" />
                <p className="text-xs text-gray-400">No athletes connected yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {clients.map((client) => (
                  <div
                    key={client.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-sm transition-all"
                    onClick={() => navigate(`/player/${client.id}`)}
                  >
                    <div className="flex items-center gap-2.5">
                      <Avatar src={client.profilePicture} name={client.name} size="sm" role="player" />
                      <div>
                        <p className="font-bold text-sm text-gray-800 dark:text-white">{client.name}</p>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">{client.sport}</span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-green-100 dark:bg-green-950/20 text-green-700 dark:text-green-400 font-black px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachDashboard;
