import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Users, ShieldCheck, BarChart3, Plus, ArrowRight, TrendingUp } from 'lucide-react';
import {
  eventService, registrationService, verificationService,
} from '../../services/supabaseService';
import { Event, VerificationDocument } from '../../types';
import toast from 'react-hot-toast';
import SkeletonCard from '../ui/SkeletonCard';

const OrgDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [totalRegistrations, setTotalRegistrations] = useState(0);
  const [pendingVerifications, setPendingVerifications] = useState<VerificationDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [orgEvents, verifications] = await Promise.all([
        eventService.getByOrganization(user.id),
        verificationService.getAllPending(),
      ]);
      setEvents(orgEvents);
      setPendingVerifications(verifications);

      // Get total registration count across all events
      let total = 0;
      await Promise.all(
        orgEvents.map(async (e) => {
          const count = await registrationService.getCountForEvent(e.id);
          total += count;
        })
      );
      setTotalRegistrations(total);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleVerification = async (docId: string, action: 'verify' | 'reject') => {
    if (!user) return;
    const success = await verificationService.updateStatus(docId, user.id, action);
    if (success) {
      toast.success(action === 'verify' ? 'Profile verified!' : 'Verification rejected.');
      loadData();
    } else {
      toast.error('Action failed.');
    }
  };

  if (!user) return null;

  const stats = [
    { label: 'Total Events', value: events.length, icon: Calendar, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/20' },
    { label: 'Registrations', value: totalRegistrations, icon: Users, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' },
    { label: 'Pending Verifications', value: pendingVerifications.length, icon: ShieldCheck, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' },
    { label: 'Active Events', value: events.filter((e) => new Date(e.date) >= new Date()).length, icon: TrendingUp, color: 'text-green-500 bg-green-50 dark:bg-green-950/20' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white flex items-center gap-3">
          Organization Dashboard
          <span className="badge-org">Academy</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Welcome, <span className="font-black text-gray-800 dark:text-white">{user.name}</span>. Manage your events and athlete verifications.
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
        {/* Events Overview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card-sports p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-header mb-0">
                <Calendar className="w-5 h-5 text-orange-500" />
                Your Events
              </h3>
              <button
                onClick={() => navigate('/events')}
                className="flex items-center gap-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:opacity-90 transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> Create Event
              </button>
            </div>

            {events.length === 0 ? (
              <div className="empty-state py-8">
                <Calendar className="w-10 h-10 text-gray-300" />
                <p className="text-sm text-gray-400">No events created yet.</p>
                <button onClick={() => navigate('/events')} className="btn-energy text-xs py-1.5 px-4">
                  Create First Event
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {events.slice(0, 5).map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-sm transition-all">
                    <div>
                      <h4 className="font-bold text-sm text-gray-800 dark:text-white">{event.eventName}</h4>
                      <p className="text-xs text-gray-400 mt-0.5">{event.sport} · {event.venue}</p>
                      <p className="text-xs text-blue-500 font-bold mt-0.5">{event.date}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        new Date(event.date) >= new Date()
                          ? 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
                      }`}>
                        {new Date(event.date) >= new Date() ? 'UPCOMING' : 'PAST'}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ))}
                {events.length > 5 && (
                  <button onClick={() => navigate('/events')} className="w-full text-center text-xs font-bold text-blue-500 hover:text-blue-600 py-2">
                    View all {events.length} events →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Pending Verifications */}
        <div>
          <div className="card-sports p-6">
            <h3 className="section-header">
              <ShieldCheck className="w-5 h-5 text-amber-500" />
              Pending Verifications
            </h3>

            {loading ? (
              <div className="space-y-3">
                <div className="h-16 skeleton rounded-xl" />
                <div className="h-16 skeleton rounded-xl" />
              </div>
            ) : pendingVerifications.length === 0 ? (
              <div className="empty-state py-8">
                <ShieldCheck className="w-8 h-8 text-gray-300" />
                <p className="text-xs text-gray-400 text-center">No pending verifications.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingVerifications.slice(0, 5).map((doc) => (
                  <div key={doc.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className="mb-2">
                      <p className="font-bold text-sm text-gray-800 dark:text-white">{doc.playerName}</p>
                      <p className="text-xs text-gray-400 capitalize">{doc.documentType.replace('_', ' ')}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{new Date(doc.uploadedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVerification(doc.id, 'verify')}
                        className="flex-1 text-[10px] font-black py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => handleVerification(doc.id, 'reject')}
                        className="flex-1 text-[10px] font-black py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
                      >
                        ✗ Reject
                      </button>
                    </div>
                  </div>
                ))}
                {pendingVerifications.length > 5 && (
                  <button onClick={() => navigate('/verification')} className="w-full text-center text-xs font-bold text-blue-500 hover:text-blue-600 py-2">
                    View all {pendingVerifications.length} →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrgDashboard;
