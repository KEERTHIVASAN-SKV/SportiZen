import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Trophy, Calendar, Users, Sparkles, ArrowRight, ShieldCheck, TrendingUp,
} from 'lucide-react';
import {
  registrationService, eventService, connectionService,
  achievementService, profileService,
} from '../../services/supabaseService';
import { Event, User } from '../../types';
import SkeletonCard from '../ui/SkeletonCard';
import Avatar from '../ui/Avatar';

const PlayerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [registeredEvents, setRegisteredEvents] = useState<Event[]>([]);
  const [connectionsCount, setConnectionsCount] = useState(0);
  const [achievementsCount, setAchievementsCount] = useState(0);
  const [recommendedCoaches, setRecommendedCoaches] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      try {
        const [regs, connCount, achvs, coaches] = await Promise.all([
          registrationService.getForPlayer(user.id),
          connectionService.getCountForUser(user.id),
          achievementService.getForUser(user.id),
          profileService.getByRole('coach'),
        ]);

        // Fetch full event objects for registrations
        const allEvents = await eventService.getAll();
        const myEvents = allEvents.filter((e) => regs.some((r) => r.eventId === e.id));
        setRegisteredEvents(myEvents);
        setConnectionsCount(connCount);
        setAchievementsCount(achvs.length);

        // Suggest coaches matching sport
        const matchingCoaches = coaches.filter(
          (c) => c.coachProfile?.sportsCategory === user.sport || c.sport === user.sport
        ).slice(0, 3);
        setRecommendedCoaches(matchingCoaches);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  if (!user) return null;

  const verificationStatus = user.playerProfile?.verificationStatus || 'none';

  const stats = [
    {
      label: 'Achievements', value: achievementsCount,
      icon: Trophy, gradient: 'from-amber-500 to-orange-500', bg: 'bg-amber-50 dark:bg-amber-950/20',
    },
    {
      label: 'Connections', value: connectionsCount,
      icon: Users, gradient: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50 dark:bg-blue-950/20',
    },
    {
      label: 'Registered Events', value: registeredEvents.length,
      icon: Calendar, gradient: 'from-green-500 to-emerald-500', bg: 'bg-green-50 dark:bg-green-950/20',
    },
    {
      label: 'Verification',
      value: verificationStatus.toUpperCase(),
      icon: Sparkles,
      gradient: verificationStatus === 'verified' ? 'from-green-500 to-emerald-500' : 'from-orange-500 to-amber-500',
      bg: verificationStatus === 'verified' ? 'bg-green-50 dark:bg-green-950/20' : 'bg-orange-50 dark:bg-orange-950/20',
    },
  ];

  const tips = [
    { icon: ShieldCheck, color: 'text-green-500', text: 'Upload a certificate or college ID to get verified and boost scout visibility.' },
    { icon: Calendar, color: 'text-blue-500', text: `Browse events in the Events tab to register for upcoming ${user.sport} tournaments.` },
    { icon: Users, color: 'text-purple-500', text: 'Connect with coaches in your sport to get guidance and grow your network.' },
    { icon: TrendingUp, color: 'text-amber-500', text: 'Add achievements to your profile to stand out to scouts and organizations.' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white flex items-center gap-3">
          Athlete Dashboard
          <span className="badge-player">Player</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Welcome back, <span className="font-black text-gray-800 dark:text-white">{user.name}</span>. Track your sports development.
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
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <div className={`w-6 h-6 bg-gradient-to-br ${stat.gradient} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Events + Coaches */}
        <div className="lg:col-span-2 space-y-6">
          {/* Registered Events */}
          <div className="card-sports p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-header mb-0">
                <Calendar className="w-5 h-5 text-green-500" />
                Registered Tournaments
              </h3>
              <button onClick={() => navigate('/events')} className="text-xs font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1">
                Browse Events <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            {registeredEvents.length === 0 ? (
              <div className="empty-state py-8">
                <Calendar className="w-10 h-10 text-gray-300" />
                <p className="text-sm font-medium text-gray-400">No events registered yet.</p>
                <button onClick={() => navigate('/events')} className="btn-primary text-xs py-1.5 px-4">Browse Events</button>
              </div>
            ) : (
              <div className="space-y-3">
                {registeredEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-sm transition-all">
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-white text-sm">{event.eventName}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">{event.sport} · {event.venue}</p>
                      <p className="text-xs text-blue-500 font-bold mt-0.5">{event.date}</p>
                    </div>
                    <span className="px-2.5 py-1 bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400 text-[10px] font-black rounded-full border border-green-200 dark:border-green-800">
                      REGISTERED
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Suggested Coaches */}
          <div className="card-sports p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-header mb-0">
                <Users className="w-5 h-5 text-blue-500" />
                Suggested Coaches
              </h3>
              <button onClick={() => navigate('/search')} className="text-xs font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            {recommendedCoaches.length === 0 ? (
              <div className="empty-state py-6">
                <Users className="w-8 h-8 text-gray-300" />
                <p className="text-sm text-gray-400">No coaches found for {user.sport} yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recommendedCoaches.map((coach) => (
                  <div
                    key={coach.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-sm transition-all cursor-pointer"
                    onClick={() => navigate(`/coach/${coach.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar src={coach.profilePicture} name={coach.name} size="sm" role="coach" />
                      <div>
                        <p className="font-bold text-sm text-gray-800 dark:text-white">{coach.name}</p>
                        <p className="text-[10px] text-gray-400 font-semibold">{coach.coachProfile?.experience || 'Experienced'} · {coach.coachProfile?.sportsCategory}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Profile Tips */}
        <div>
          <div className="card-sports p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="font-extrabold text-gray-800 dark:text-white text-sm">Profile Tips</p>
                <p className="text-[10px] text-gray-400 font-semibold">Steps to boost your visibility</p>
              </div>
            </div>

            <div className="space-y-3">
              {tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-100 dark:border-gray-700">
                  <tip.icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${tip.color}`} />
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed font-medium">{tip.text}</p>
                </div>
              ))}
            </div>

            {verificationStatus !== 'verified' && (
              <button
                onClick={() => navigate('/verification')}
                className="w-full py-2.5 btn-primary text-xs flex items-center justify-center gap-2 mt-2"
              >
                <ShieldCheck className="w-4 h-4" />
                Get Verified Now
              </button>
            )}

            {verificationStatus === 'verified' && (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl">
                <ShieldCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                <p className="text-xs font-bold text-green-700 dark:text-green-400">Your profile is verified! ✅</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerDashboard;
