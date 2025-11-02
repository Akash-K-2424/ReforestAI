import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, MapPin, Trash2, Search, X, Calendar, TrendingUp } from 'lucide-react';

const LocationHistory = ({ onSelectLocation, onDeleteLocation }) => {
  const [history, setHistory] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredHistory, setFilteredHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = history.filter(loc =>
        loc.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.query?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredHistory(filtered);
    } else {
      setFilteredHistory(history);
    }
  }, [searchQuery, history]);

  const loadHistory = () => {
    try {
      const saved = localStorage.getItem('locationHistory');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Sort by most recent first
        const sorted = parsed.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setHistory(sorted);
        setFilteredHistory(sorted);
      }
    } catch (error) {
      console.error('Failed to load location history:', error);
    }
  };

  const handleDelete = (locationId) => {
    const updated = history.filter(loc => loc.id !== locationId);
    setHistory(updated);
    setFilteredHistory(filteredHistory.filter(loc => loc.id !== locationId));
    localStorage.setItem('locationHistory', JSON.stringify(updated));
    if (onDeleteLocation) {
      onDeleteLocation(locationId);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all location history?')) {
      setHistory([]);
      setFilteredHistory([]);
      localStorage.removeItem('locationHistory');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getPriorityBadgeColor = (priorityColor) => {
    switch (priorityColor) {
      case 'green':
        return 'bg-green-500 text-white';
      case 'yellow':
        return 'bg-yellow-500 text-white';
      case 'red':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Search */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Location History ({history.length})
          </h3>
        </div>
        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Search Bar */}
      {history.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <div className="text-center py-12">
          <History className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery ? 'No locations found' : 'No location history yet'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
            {searchQuery ? 'Try a different search term' : 'Analyze locations to build your history'}
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          <AnimatePresence>
            {filteredHistory.map((location) => (
              <motion.div
                key={location.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 cursor-pointer" onClick={() => onSelectLocation?.(location)}>
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {location.name || location.query || 'Unknown Location'}
                      </h4>
                      {location.priorityColor && (
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeColor(location.priorityColor)}`}>
                          {location.priority || 'N/A'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(location.timestamp)}</span>
                      </div>
                      {location.score && (
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>Score: {location.score}/100</span>
                        </div>
                      )}
                    </div>
                    {location.features && (
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-500">
                        {location.features.ndvi && (
                          <span>NDVI: {location.features.ndvi.toFixed(2)}</span>
                        )}
                        {location.features.ndwi && (
                          <span>NDWI: {location.features.ndwi.toFixed(2)}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(location.id);
                    }}
                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ml-2"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default LocationHistory;

