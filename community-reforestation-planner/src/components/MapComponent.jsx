import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Search } from 'lucide-react';

const MapComponent = ({ onLocationSelect }) => {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Mock coordinates for demonstration
  const mockLocations = [
    { name: "Central Park", lat: 40.7829, lng: -73.9654, score: 95 },
    { name: "Riverside Park", lat: 40.7794, lng: -73.9882, score: 88 },
    { name: "Prospect Park", lat: 40.6602, lng: -73.9690, score: 82 },
    { name: "High Line", lat: 40.7480, lng: -74.0048, score: 79 }
  ];

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleLocationClick = (location) => {
    onLocationSelect(location);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Simulate search functionality
    const foundLocation = mockLocations.find(loc => 
      loc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (foundLocation) {
      onLocationSelect(foundLocation);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading map...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-full relative">
      {/* Search Bar */}
      <div className="absolute top-4 left-4 right-4 z-10">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search for locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-lg"
          />
        </form>
      </div>

      {/* Map Placeholder */}
      <div className="h-full bg-gradient-to-br from-green-100 via-blue-50 to-green-100 dark:from-green-900/20 dark:via-blue-900/20 dark:to-green-900/20 rounded-lg relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="map-trees" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse"><path d="M15 5 L12 15 L18 15 Z" fill="%234CAF50" opacity="0.3"/></pattern></defs><rect width="100" height="100" fill="url(%23map-trees)"/></svg>')`,
            backgroundSize: '150px 150px'
          }} />
        </div>

        {/* Mock Map Content */}
        <div className="absolute inset-0 p-8">
          <div className="h-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 relative">
            {/* Map Title */}
            <div className="absolute top-4 left-4">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                Interactive Planting Map
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Click on markers to view planting opportunities
              </p>
            </div>

            {/* Mock Map Markers */}
            <div className="absolute inset-0 p-8">
              {mockLocations.map((location, index) => (
                <motion.button
                  key={location.name}
                  className="absolute group"
                  style={{
                    left: `${20 + (index * 20)}%`,
                    top: `${30 + (index * 15)}%`,
                  }}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleLocationClick(location)}
                >
                  <div className="relative">
                    <div className={`w-8 h-8 rounded-full border-4 border-white shadow-lg flex items-center justify-center ${
                      location.score >= 90 ? 'bg-green-500' :
                      location.score >= 80 ? 'bg-yellow-500' :
                      location.score >= 70 ? 'bg-orange-500' : 'bg-red-500'
                    }`}>
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap">
                        <div className="font-medium">{location.name}</div>
                        <div className="text-xs">Score: {location.score}/100</div>
                      </div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Map Legend */}
            <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 border border-gray-200 dark:border-gray-700">
              <h5 className="font-medium text-gray-900 dark:text-white mb-2">Impact Score</h5>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-gray-700 dark:text-gray-300">High (90-100)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-gray-700 dark:text-gray-300">Good (80-89)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  <span className="text-gray-700 dark:text-gray-300">Medium (70-79)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-gray-700 dark:text-gray-300">Low (60-69)</span>
                </div>
              </div>
            </div>

            {/* Map Controls */}
            <div className="absolute bottom-4 left-4 space-y-2">
              <button className="w-10 h-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <span className="text-lg font-bold">+</span>
              </button>
              <button className="w-10 h-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <span className="text-lg font-bold">-</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          💡 Click on markers to explore planting opportunities
        </p>
      </div>
    </div>
  );
};

export default MapComponent;
