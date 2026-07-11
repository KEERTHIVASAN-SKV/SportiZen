import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Search, Filter, MapPin, Star, Award, ShieldCheck, X, Users,
} from 'lucide-react';
import { User, SPORTS_CATEGORIES } from '../../types';
import { profileService } from '../../services/supabaseService';
import SkeletonCard from '../ui/SkeletonCard';
import EmptyState from '../ui/EmptyState';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';

type SearchRole = 'coach' | 'player' | 'organization';

const SearchPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [activeRole, setActiveRole] = useState<SearchRole>(() =>
    currentUser?.role === 'player' ? 'coach' : 'player'
  );
  const [results, setResults] = useState<User[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);

  const doSearch = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const data = await profileService.search({
        query: searchTerm || undefined,
        role: activeRole,
        sport: selectedSport || undefined,
        location: selectedLocation || undefined,
        limit: 50,
      });
      // Exclude self
      setResults(data.filter((u) => u.id !== currentUser.id));
    } finally {
      setLoading(false);
    }
  }, [currentUser, searchTerm, activeRole, selectedSport, selectedLocation]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(doSearch, 300);
    return () => clearTimeout(timer);
  }, [doSearch]);

  const handleProfileClick = (user: User) => {
    if (user.role === 'player') navigate(`/player/${user.id}`);
    else if (user.role === 'coach') navigate(`/coach/${user.id}`);
    else navigate(`/organization/${user.id}`);
  };

  const roleTabs: { key: SearchRole; label: string }[] = [
    { key: 'player', label: 'Players' },
    { key: 'coach', label: 'Coaches' },
    { key: 'organization', label: 'Organizations' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white">Discover</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Find players, coaches, and organizations on SportiZen.</p>
      </div>

      {/* Role Tabs */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {roleTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveRole(tab.key)}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${
              activeRole === tab.key
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search + Filter Bar */}
      <div className="glass rounded-2xl p-5 mb-8 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-[18px] h-[18px]" />
            <input
              type="text"
              placeholder={`Search ${activeRole}s by name, bio...`}
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
                : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-blue-300'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Sport</label>
              <select value={selectedSport} onChange={(e) => setSelectedSport(e.target.value)} className="input-sports">
                <option value="">All Sports</option>
                {SPORTS_CATEGORIES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">Location</label>
              <input
                type="text"
                placeholder="City, State..."
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="input-sports"
              />
            </div>
            <div className="md:col-span-2 flex justify-between items-center">
              <span className="text-xs text-gray-400 font-semibold">{results.length} result{results.length !== 1 ? 's' : ''}</span>
              <button
                onClick={() => { setSelectedSport(''); setSelectedLocation(''); setShowFilters(false); }}
                className="text-xs font-bold text-blue-500 hover:text-blue-600 flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SkeletonCard type="profile" count={6} />
        </div>
      ) : results.length === 0 ? (
        <EmptyState
          icon={Users}
          title={`No ${activeRole}s found`}
          message="Try a different search term or adjust your filters."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((profile) => (
            <div
              key={profile.id}
              className="card-sports p-6 flex flex-col cursor-pointer"
              onClick={() => handleProfileClick(profile)}
            >
              <div className="flex items-center gap-3 mb-4">
                <Avatar src={profile.profilePicture} name={profile.name} size="lg" role={profile.role} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-gray-800 dark:text-white text-sm leading-tight">{profile.name}</h3>
                    {profile.role === 'player' && profile.playerProfile?.verificationStatus === 'verified' && (
                      <ShieldCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-gray-400 font-semibold">@{profile.username}</p>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                <Badge variant={profile.role === 'player' ? 'sport' : profile.role === 'coach' ? 'coach' : 'org'}>
                  {profile.role === 'coach' ? profile.coachProfile?.sportsCategory || profile.sport : profile.sport}
                </Badge>
                {profile.location && (
                  <span className="flex items-center gap-1 text-[10px] text-gray-400 font-bold">
                    <MapPin className="w-3 h-3 text-red-400" />
                    {profile.location}
                  </span>
                )}
              </div>

              {/* Bio */}
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4 line-clamp-2 flex-1">
                {profile.bio || `${profile.role.charAt(0).toUpperCase() + profile.role.slice(1)} on SportiZen.`}
              </p>

              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 p-2.5 rounded-xl">
                {profile.role === 'coach' ? (
                  <>
                    <span className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-blue-500" />
                      {profile.coachProfile?.experience || 'Experienced'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {profile.coachProfile?.rating || '5.0'} rating
                    </span>
                  </>
                ) : profile.role === 'player' ? (
                  <>
                    <span className="flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 text-amber-400" />
                      {profile.achievements?.length || 0} achievements
                    </span>
                    <span className="flex items-center gap-1.5">
                      🎯 {profile.playerProfile?.position || 'All positions'}
                    </span>
                  </>
                ) : (
                  <span className="col-span-2 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-orange-500" />
                    {profile.orgProfile?.organizationName || profile.name}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;