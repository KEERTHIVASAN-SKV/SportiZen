import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Trophy } from 'lucide-react';
import { User, SPORTS_CATEGORIES } from '../../types';
import AthleteCard from './AthleteCard';

const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSport, setSelectedSport] = useState('');
  const [athletes, setAthletes] = useState<User[]>([]);
  const [filteredAthletes, setFilteredAthletes] = useState<User[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Load athletes from localStorage
    const users = JSON.parse(localStorage.getItem('sportizen-users') || '[]');
    setAthletes(users);
    setFilteredAthletes(users);
  }, []);

  useEffect(() => {
    const filtered = athletes.filter(athlete => {
      const matchesSearch = searchTerm === '' || 
        athlete.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        athlete.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        athlete.bio?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSport = selectedSport === '' || athlete.sport === selectedSport;
      
      return matchesSearch && matchesSport;
    });

    setFilteredAthletes(filtered);
  }, [searchTerm, selectedSport, athletes]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Search Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
          Discover Athletes
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Connect with fellow athletes and sports professionals
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search athletes by name, username, or bio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sport Category
                </label>
                <select
                  value={selectedSport}
                  onChange={(e) => setSelectedSport(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">All Sports</option>
                  {SPORTS_CATEGORIES.map(sport => (
                    <option key={sport} value={sport}>{sport}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="Enter location..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sort By
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="relevance">Relevance</option>
                  <option value="achievements">Most Achievements</option>
                  <option value="followers">Most Followers</option>
                  <option value="recent">Recently Joined</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {filteredAthletes.length} athlete{filteredAthletes.length !== 1 ? 's' : ''} found
              </span>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSport('');
                  setShowFilters(false);
                }}
                className="text-sm text-blue-500 hover:text-blue-600 font-medium"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {filteredAthletes.length === 0 ? (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-2">
            No athletes found
          </h3>
          <p className="text-gray-400 dark:text-gray-500">
            Try adjusting your search criteria or filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAthletes.map((athlete) => (
            <AthleteCard key={athlete.id} athlete={athlete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;