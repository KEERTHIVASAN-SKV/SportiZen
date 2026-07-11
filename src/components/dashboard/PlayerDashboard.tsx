import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Trophy, Calendar, Users, Sparkles, Send, Loader2, ArrowRight,
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

  // AI Chat
  const [aiMessages, setAiMessages] = useState<{ sender: 'ai' | 'user'; text: string }[]>([
    { sender: 'ai', text: `Hello ${user?.name}! I'm your AI Talent Advisor. Ask me about coaches, events, or your career path! 🏆` },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

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

  const handleAiAction = (type: 'analyze' | 'coaches' | 'events' | 'custom', customText?: string) => {
    setIsAiLoading(true);
    const userText = customText ||
      (type === 'analyze' ? 'Analyze my sports portfolio & career path' :
       type === 'coaches' ? 'Recommend coaches matching my profile' :
       'Recommend upcoming events');

    setAiMessages((prev) => [...prev, { sender: 'user', text: userText }]);

    setTimeout(() => {
      let response = '';
      if (type === 'analyze') {
        response = `**PROFILE ANALYSIS — ${user?.name?.toUpperCase()}**\n\n` +
          `• **Sport**: ${user?.sport} | **Status**: ${user?.playerProfile?.verificationStatus === 'verified' ? 'Verified ✅' : 'Unverified ⚠️'}\n` +
          `• **Achievements**: ${achievementsCount} recorded\n` +
          `• **Connections**: ${connectionsCount} active\n\n` +
          `**Recommendations**:\n1. Upload verification docs for higher visibility\n2. Join ${user?.sport} tournaments to build your record\n3. Connect with coaches to accelerate your development`;
      } else if (type === 'coaches') {
        if (recommendedCoaches.length > 0) {
          const list = recommendedCoaches.map((c) => `• **${c.name}** — ${c.coachProfile?.experience || 'Experienced'}`).join('\n');
          response = `**COACHES FOR ${user?.sport?.toUpperCase()}**:\n\n${list}\n\n*Go to Coaches tab to connect!*`;
        } else {
          response = `No coaches found for **${user?.sport}** yet. More coaches are joining daily!`;
        }
      } else if (type === 'events') {
        if (registeredEvents.length > 0) {
          const list = registeredEvents.map((e) => `• **${e.eventName}** — ${e.date}`).join('\n');
          response = `**YOUR REGISTERED EVENTS**:\n\n${list}\n\nKeep training hard! 💪`;
        } else {
          response = `You haven't registered for any events yet. Check the **Events** tab to find tournaments in ${user?.sport}!`;
        }
      } else {
        response = `Great question! Based on your **${user?.sport}** profile, I recommend: 1) Connect with 2-3 coaches, 2) Register for upcoming tournaments, 3) Complete profile verification to boost visibility by 70%.`;
      }
      setAiMessages((prev) => [...prev, { sender: 'ai', text: response }]);
      setIsAiLoading(false);
    }, 1200);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    const msg = inputMessage;
    setInputMessage('');
    handleAiAction('custom', msg);
  };

  if (!user) return null;

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
      value: user.playerProfile?.verificationStatus?.toUpperCase() || 'NONE',
      icon: Sparkles,
      gradient: user.playerProfile?.verificationStatus === 'verified' ? 'from-green-500 to-emerald-500' : 'from-orange-500 to-amber-500',
      bg: user.playerProfile?.verificationStatus === 'verified' ? 'bg-green-50 dark:bg-green-950/20' : 'bg-orange-50 dark:bg-orange-950/20',
    },
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

        {/* Right: AI Advisor */}
        <div>
          <div className="rounded-2xl overflow-hidden shadow-lg border border-blue-950/40 flex flex-col h-[500px]"
            style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0c1a0f 100%)' }}>
            <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
              <div className="p-2 bg-gradient-to-br from-blue-400 to-teal-400 rounded-xl">
                <Sparkles className="w-4 h-4 text-white animate-spin" style={{ animationDuration: '4s' }} />
              </div>
              <div>
                <p className="font-extrabold text-white text-xs tracking-wide">AI TALENT ADVISOR</p>
                <span className="text-[10px] text-green-300 font-bold">● Online</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
              {aiMessages.map((msg, i) => (
                <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-xl p-3 leading-relaxed whitespace-pre-line ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white/10 text-gray-200 border border-white/5 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isAiLoading && (
                <div className="flex justify-start">
                  <div className="bg-white/10 rounded-xl p-3 border border-white/5 flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 text-teal-400 animate-spin" />
                    <span className="text-[10px] text-gray-400 font-bold">Thinking...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="px-4 pb-2 grid grid-cols-1 gap-1.5 border-t border-white/10 pt-3">
              {[
                { label: 'Analyze my portfolio', type: 'analyze' as const },
                { label: 'Find matching coaches', type: 'coaches' as const },
                { label: 'My registered events', type: 'events' as const },
              ].map((action) => (
                <button
                  key={action.type}
                  onClick={() => handleAiAction(action.type)}
                  disabled={isAiLoading}
                  className="flex items-center justify-between px-3 py-2 bg-white/5 hover:bg-white/15 rounded-xl border border-white/5 text-[11px] text-blue-300 font-bold disabled:opacity-50 transition-all"
                >
                  {action.label}
                  <ArrowRight className="w-3 h-3" />
                </button>
              ))}
            </div>

            {/* Chat Input */}
            <div className="px-4 pb-4 pt-2">
              <form onSubmit={handleSendMessage} className="relative">
                <input
                  type="text"
                  placeholder="Ask me anything..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  disabled={isAiLoading}
                  className="w-full pl-3 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
                />
                <button type="submit" disabled={isAiLoading || !inputMessage.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-blue-400 hover:text-white disabled:opacity-50">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerDashboard;
