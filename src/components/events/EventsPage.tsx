import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Calendar, MapPin, Clock, Users, ChevronRight, Filter, Search, X,
} from 'lucide-react';
import { eventService, registrationService } from '../../services/supabaseService';
import { Event } from '../../types';
import { SPORTS_CATEGORIES } from '../../types';
import toast from 'react-hot-toast';
import SkeletonCard from '../ui/SkeletonCard';
import EmptyState from '../ui/EmptyState';

const EventsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [registeredEventIds, setRegisteredEventIds] = useState<Set<string>>(new Set());
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [allEvents, myRegs] = await Promise.all([
        eventService.getAll(),
        user.role === 'player' ? registrationService.getForPlayer(user.id) : Promise.resolve([]),
      ]);
      setEvents(allEvents);
      setRegisteredEventIds(new Set(myRegs.map((r) => r.eventId)));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredEvents = events.filter((e) => {
    const matchSearch = !searchTerm ||
      e.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.organizationName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSport = !selectedSport || e.sport === selectedSport;
    return matchSearch && matchSport;
  });

  const handleRegister = async (event: Event) => {
    if (!user || user.role !== 'player') return;
    setProcessingId(event.id);
    try {
      const reg = await registrationService.register({
        eventId: event.id,
        playerId: user.id,
        playerName: user.name,
        playerSport: user.sport,
      });
      if (reg) {
        setRegisteredEventIds((prev) => new Set([...prev, event.id]));
        toast.success(`Registered for ${event.eventName}!`);
      } else {
        toast.error('Registration failed. Please try again.');
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancel = async (eventId: string) => {
    if (!user) return;
    setProcessingId(eventId);
    try {
      const success = await registrationService.cancel(eventId, user.id);
      if (success) {
        setRegisteredEventIds((prev) => { const s = new Set(prev); s.delete(eventId); return s; });
        toast.success('Registration cancelled.');
      }
    } finally {
      setProcessingId(null);
    }
  };

  const isPastDeadline = (deadline: string) => new Date(deadline) < new Date();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white">Browse Events</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Discover tournaments, tryouts, and scouting events near you.</p>
      </div>

      {/* Search + Filter Bar */}
      <div className="glass rounded-2xl p-5 mb-8 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5 w-[18px] h-[18px]" />
            <input
              type="text"
              placeholder="Search events, venues, organizations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-sports pl-11"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm border transition-all ${
              showFilters
                ? 'bg-blue-500 text-white border-blue-500'
                : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-blue-300 hover:text-blue-500'
            }`}
          >
            <Filter className="w-4 h-4" />
            {selectedSport || 'Filters'}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Sport</label>
                <select
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                  className="input-sports"
                >
                  <option value="">All Sports</option>
                  {SPORTS_CATEGORIES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="flex justify-between mt-3">
              <span className="text-xs text-gray-400 font-semibold">
                {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
              </span>
              <button
                onClick={() => { setSelectedSport(''); setSearchTerm(''); setShowFilters(false); }}
                className="text-xs font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard type="event" count={6} />
        </div>
      ) : filteredEvents.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No events found"
          message="Try adjusting your filters or check back later for new events."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => {
            const isRegistered = registeredEventIds.has(event.id);
            const deadlinePassed = isPastDeadline(event.registrationDeadline);
            const isProcessing = processingId === event.id;

            return (
              <div key={event.id} className="card-sports overflow-hidden flex flex-col relative">
                {/* Poster */}
                <div className="h-44 bg-gradient-to-br from-blue-600 via-purple-600 to-teal-500 relative overflow-hidden flex-shrink-0">
                  {event.posterUrl && (
                    <img src={event.posterUrl} alt={event.eventName} className="w-full h-full object-cover" loading="lazy" />
                  )}
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm text-white text-[10px] font-black rounded-full uppercase tracking-wider border border-white/20">
                      {event.sport}
                    </span>
                  </div>
                  {isRegistered && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 bg-green-500 text-white text-[10px] font-black rounded-full uppercase">
                        ✓ Registered
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-black text-gray-800 dark:text-white text-base mb-1 line-clamp-2">{event.eventName}</h3>
                  <p className="text-xs text-gray-400 font-semibold mb-3">by {event.organizationName}</p>

                  <div className="space-y-1.5 mb-4 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                      {event.venue}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                      {new Date(event.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                      <span className={deadlinePassed ? 'text-red-400 font-bold' : ''}>
                        Deadline: {new Date(event.registrationDeadline).toLocaleDateString()}
                        {deadlinePassed && ' (Closed)'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                      Eligibility: {event.eligibility}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto">
                    {user?.role === 'player' ? (
                      isRegistered ? (
                        <button
                          onClick={() => handleCancel(event.id)}
                          disabled={isProcessing}
                          className="w-full py-2.5 bg-red-50 dark:bg-red-950/20 text-red-500 border border-red-200 dark:border-red-800 font-bold rounded-xl text-xs hover:bg-red-100 transition-all disabled:opacity-60"
                        >
                          {isProcessing ? 'Cancelling...' : 'Cancel Registration'}
                        </button>
                      ) : deadlinePassed ? (
                        <button disabled className="w-full py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-400 font-bold rounded-xl text-xs cursor-not-allowed">
                          Registration Closed
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRegister(event)}
                          disabled={isProcessing}
                          className="w-full py-2.5 btn-primary text-xs"
                        >
                          {isProcessing ? 'Registering...' : 'Register Now'}
                        </button>
                      )
                    ) : (
                      <button
                        onClick={() => navigate(`/organization/${event.organizationId}`)}
                        className="w-full py-2.5 btn-ghost text-xs flex items-center justify-center gap-1"
                      >
                        View Organizer <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EventsPage;
