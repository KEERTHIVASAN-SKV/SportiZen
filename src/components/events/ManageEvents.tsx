import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Plus, Edit, Trash2, Users, Calendar, MapPin, ChevronDown, ChevronUp, X,
  Image, Clock, AlertTriangle,
} from 'lucide-react';
import { eventService, registrationService, storageService } from '../../services/supabaseService';
import { Event, EventRegistration, SPORTS_CATEGORIES } from '../../types';
import toast from 'react-hot-toast';
import SkeletonCard from '../ui/SkeletonCard';
import EmptyState from '../ui/EmptyState';

// ──────────────────────────────────────────────────────
// Event Form
// ──────────────────────────────────────────────────────
interface EventFormProps {
  event?: Event | null;
  onSave: () => void;
  onCancel: () => void;
  orgId: string;
  orgName: string;
}

const EventForm: React.FC<EventFormProps> = ({ event, onSave, onCancel, orgId, orgName }) => {
  const [form, setForm] = useState({
    eventName: event?.eventName || '',
    sport: event?.sport || '',
    venue: event?.venue || '',
    eligibility: event?.eligibility || '',
    date: event?.date || '',
    registrationDeadline: event?.registrationDeadline || '',
    description: event?.description || '',
    maxParticipants: event?.maxParticipants?.toString() || '',
  });
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreview, setPosterPreview] = useState<string | null>(event?.posterUrl || null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePosterSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Poster must be less than 5MB'); return; }
    setPosterFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPosterPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let posterUrl = event?.posterUrl;

      if (posterFile) {
        const eventId = event?.id || `temp-${Date.now()}`;
        const url = await storageService.uploadEventPoster(orgId, eventId, posterFile);
        if (url) posterUrl = url;
      }

      if (event) {
        await eventService.update(event.id, {
          event_name: form.eventName,
          sport: form.sport,
          venue: form.venue,
          eligibility: form.eligibility,
          date: form.date,
          registration_deadline: form.registrationDeadline,
          description: form.description,
          poster_url: posterUrl,
          max_participants: form.maxParticipants ? parseInt(form.maxParticipants) : undefined,
        });
        toast.success('Event updated!');
      } else {
        await eventService.create({
          organizationId: orgId,
          organizationName: orgName,
          eventName: form.eventName,
          sport: form.sport,
          venue: form.venue,
          eligibility: form.eligibility,
          date: form.date,
          registrationDeadline: form.registrationDeadline,
          description: form.description,
          posterUrl,
          maxParticipants: form.maxParticipants ? parseInt(form.maxParticipants) : undefined,
        });
        toast.success('Event created & players notified!');
      }
      onSave();
    } catch {
      toast.error('Failed to save event. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-100 dark:border-gray-700 my-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="font-black text-gray-800 dark:text-white text-lg">
            {event ? 'Edit Event' : 'Create New Event'}
          </h2>
          <button onClick={onCancel} className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Poster Upload */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Event Poster</label>
            <div
              className="relative h-40 bg-gradient-to-br from-blue-600 via-purple-600 to-teal-500 rounded-xl overflow-hidden cursor-pointer hover:opacity-95 transition-all"
              onClick={() => document.getElementById('poster-upload')?.click()}
            >
              {posterPreview && <img src={posterPreview} alt="poster" className="w-full h-full object-cover" />}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
                <Image className="w-8 h-8 mb-2 opacity-80" />
                <span className="text-xs font-bold opacity-80">Click to upload poster</span>
              </div>
            </div>
            <input id="poster-upload" type="file" accept="image/*" onChange={handlePosterSelect} className="hidden" />
          </div>

          {/* Event Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Event Name *</label>
              <input type="text" name="eventName" value={form.eventName} onChange={handleChange} className="input-sports" placeholder="State Football Championship" required />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Sport *</label>
              <select name="sport" value={form.sport} onChange={handleChange} className="input-sports" required>
                <option value="">Select Sport</option>
                {SPORTS_CATEGORIES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Venue *</label>
            <input type="text" name="venue" value={form.venue} onChange={handleChange} className="input-sports" placeholder="Sports Complex, City" required />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Eligibility Requirements *</label>
            <input type="text" name="eligibility" value={form.eligibility} onChange={handleChange} className="input-sports" placeholder="e.g. Under-18, Amateur only" required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Event Date *</label>
              <input type="date" name="date" value={form.date} onChange={handleChange} className="input-sports" required />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Registration Deadline *</label>
              <input type="date" name="registrationDeadline" value={form.registrationDeadline} onChange={handleChange} className="input-sports" required />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Max Participants</label>
              <input type="number" name="maxParticipants" value={form.maxParticipants} onChange={handleChange} className="input-sports" placeholder="Unlimited" min="1" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="input-sports resize-none" placeholder="Event details, rules, prizes..." rows={3} required />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
            <button type="button" onClick={onCancel} className="btn-ghost text-sm">Cancel</button>
            <button type="submit" disabled={saving} className="btn-energy text-sm flex items-center gap-2">
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : event ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────
// Registrations Drawer
// ──────────────────────────────────────────────────────
const RegistrationsDrawer: React.FC<{ event: Event; onClose: () => void }> = ({ event, onClose }) => {
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    registrationService.getForEvent(event.id).then((regs) => {
      setRegistrations(regs);
      setLoading(false);
    });
  }, [event.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[80vh] flex flex-col border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <h3 className="font-black text-gray-800 dark:text-white">Registrations for {event.eventName}</h3>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading ? (
            [...Array(3)].map((_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)
          ) : registrations.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm font-semibold">No registrations yet.</div>
          ) : (
            registrations.map((reg) => (
              <div key={reg.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                <div>
                  <p className="font-bold text-sm text-gray-800 dark:text-white">{reg.playerName}</p>
                  <p className="text-xs text-gray-400">{reg.playerSport}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{new Date(reg.registrationDate).toLocaleDateString()}</p>
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  reg.status === 'registered'
                    ? 'bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400'
                }`}>
                  {reg.status.toUpperCase()}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="px-6 py-3 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 font-semibold">
          {registrations.filter((r) => r.status === 'registered').length} of {event.maxParticipants || '∞'} registered
        </div>
      </div>
    </div>
  );
};

// ──────────────────────────────────────────────────────
// MAIN ManageEvents Component
// ──────────────────────────────────────────────────────
const ManageEvents: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [viewRegsEvent, setViewRegsEvent] = useState<Event | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const data = await eventService.getByOrganization(user.id);
    setEvents(data);
    setLoading(false);
  }, [user]);

  useEffect(() => { loadEvents(); }, [loadEvents]);

  const handleDelete = async (eventId: string) => {
    if (!window.confirm('Delete this event? This will also remove all registrations.')) return;
    setDeletingId(eventId);
    const success = await eventService.delete(eventId);
    if (success) {
      toast.success('Event deleted.');
      loadEvents();
    } else {
      toast.error('Failed to delete event.');
    }
    setDeletingId(null);
  };

  if (!user) return null;

  const orgName = user.orgProfile?.organizationName || user.name;
  const activeEvents = events.filter((e) => new Date(e.date) >= new Date());
  const pastEvents = events.filter((e) => new Date(e.date) < new Date());

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white">Manage Events</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{events.length} total events · {activeEvents.length} upcoming</p>
        </div>
        <button
          onClick={() => { setEditingEvent(null); setShowForm(true); }}
          className="btn-energy flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Create Event
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Events', value: events.length, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/20' },
          { label: 'Active Events', value: activeEvents.length, color: 'text-green-500 bg-green-50 dark:bg-green-950/20' },
          { label: 'Past Events', value: pastEvents.length, color: 'text-gray-500 bg-gray-100 dark:bg-gray-700' },
          { label: 'Total Sports', value: new Set(events.map((e) => e.sport)).size, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">{s.label}</span>
              <span className="text-2xl font-black text-gray-800 dark:text-white">{s.value}</span>
            </div>
            <div className={`p-3 rounded-xl ${s.color}`}>
              <Calendar className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonCard type="event" count={4} />
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No events created yet"
          message="Create your first event to start accepting registrations from players."
          action={{ label: 'Create First Event', onClick: () => setShowForm(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => {
            const isUpcoming = new Date(event.date) >= new Date();
            return (
              <div key={event.id} className="card-sports overflow-hidden relative">
                {/* Status Indicator */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${isUpcoming ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-300 dark:bg-gray-700'}`} />

                {/* Event Poster */}
                <div className="h-36 bg-gradient-to-br from-blue-600 via-purple-600 to-teal-500 relative overflow-hidden">
                  {event.posterUrl && <img src={event.posterUrl} alt={event.eventName} className="w-full h-full object-cover" loading="lazy" />}
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm text-white text-[10px] font-black rounded-full">{event.sport}</span>
                    <span className={`px-2.5 py-1 text-[10px] font-black rounded-full ${isUpcoming ? 'bg-green-500 text-white' : 'bg-gray-600 text-white'}`}>
                      {isUpcoming ? 'UPCOMING' : 'PAST'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-black text-gray-800 dark:text-white text-base mb-3 line-clamp-1">{event.eventName}</h3>

                  <div className="space-y-1.5 mb-4 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-red-400" />
                      {event.venue}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-blue-400" />
                      {new Date(event.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      Deadline: {new Date(event.registrationDeadline).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setViewRegsEvent(event)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 font-bold text-xs rounded-xl hover:bg-blue-100 transition-all border border-blue-100 dark:border-blue-900"
                    >
                      <Users className="w-3.5 h-3.5" />
                      View Registrations
                    </button>
                    <button
                      onClick={() => { setEditingEvent(event); setShowForm(true); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 font-bold text-xs rounded-xl hover:bg-amber-100 transition-all border border-amber-100 dark:border-amber-900"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(event.id)}
                      disabled={deletingId === event.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 dark:bg-red-950/20 text-red-500 font-bold text-xs rounded-xl hover:bg-red-100 transition-all border border-red-100 dark:border-red-900 disabled:opacity-60"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Event Form Modal */}
      {showForm && (
        <EventForm
          event={editingEvent}
          orgId={user.id}
          orgName={orgName}
          onSave={() => { setShowForm(false); loadEvents(); }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {/* Registrations Drawer */}
      {viewRegsEvent && (
        <RegistrationsDrawer event={viewRegsEvent} onClose={() => setViewRegsEvent(null)} />
      )}
    </div>
  );
};

export default ManageEvents;
