import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap, LayersControl } from 'react-leaflet';
import L from 'leaflet';
import { analyzeLocation, getCachedAnalysis, cacheAnalysis } from '../services/api';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom priority marker icons
const createPriorityIcon = (color) => {
  return L.divIcon({
    className: 'custom-priority-marker',
    html: `
      <div style="
        width: 40px;
        height: 40px;
        background-color: ${color};
        border: 4px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
};

// Component to handle map view updates
function MapViewUpdater({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && center.length === 2 && !isNaN(center[0]) && !isNaN(center[1])) {
      map.setView(center, zoom || 13, {
        animate: true,
        duration: 1.0
      });
      // Force map to invalidate size to ensure markers are visible
      setTimeout(() => {
        map.invalidateSize();
      }, 300);
    }
  }, [center, zoom, map]);
  
  return null;
}

// Component to handle marker updates and ensure map shows them
function MarkerUpdater({ markerCount }) {
  const map = useMap();
  
  useEffect(() => {
    // Invalidate map size when markers are added
    if (markerCount > 0) {
      const timer = setTimeout(() => {
        map.invalidateSize();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [markerCount, map]);
  
  return null;
}

const MapComponent = ({ onLocationSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState(null);
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629]); // Default: India center
  const [mapZoom, setMapZoom] = useState(5);
  const [selectedMarker, setSelectedMarker] = useState(null);

  // Mock coordinates for demonstration (fallback)
  const mockLocations = [
    { name: "Central Park", lat: 40.7829, lng: -73.9654, score: 95, priority: 'Green', priorityColor: 'green' },
    { name: "Riverside Park", lat: 40.7794, lng: -73.9882, score: 88, priority: 'Yellow', priorityColor: 'yellow' },
    { name: "Prospect Park", lat: 40.6602, lng: -73.9690, score: 82, priority: 'Yellow', priorityColor: 'yellow' },
    { name: "High Line", lat: 40.7480, lng: -74.0048, score: 79, priority: 'Red', priorityColor: 'red' }
  ];

  useEffect(() => {
    // Initialize map
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Error boundary for map rendering
  if (typeof window === 'undefined') {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Map loading...</p>
      </div>
    );
  }

  const handleLocationClick = (location) => {
    setSelectedMarker(location);
    onLocationSelect(location);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    setAnalysisStep('Geocoding location...');

    try {
      // Check cache first
      const cached = await getCachedAnalysis(searchQuery);
      if (cached) {
        setAnalysisStep('Loading from cache...');
        await new Promise(resolve => setTimeout(resolve, 300));
        processAnalysisResult(cached);
        setIsAnalyzing(false);
        return;
      }

      // Perform full analysis
      setAnalysisStep('📍 Geocoding location...');
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setAnalysisStep('🛰️ Retrieving satellite data...');
      const result = await analyzeLocation(searchQuery);
      
      if (result.success) {
        // Cache the result
        cacheAnalysis(searchQuery, result);
        
        setAnalysisStep('✅ Analysis complete!');
        await new Promise(resolve => setTimeout(resolve, 300));
        
        processAnalysisResult(result);
      } else {
        // Handle geocoding or analysis errors with suggestions
        const errorMessage = result.error || 'Analysis failed';
        const suggestion = result.suggestion ? `\n\n💡 ${result.suggestion}` : '';
        setError(errorMessage + suggestion);
        setIsAnalyzing(false);
        return;
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Failed to analyze location. Please try again.');
      setIsAnalyzing(false);
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  const processAnalysisResult = (result) => {
    const { location, prediction, satelliteData } = result;
    
    // Validate coordinates
    if (!location.coordinates || 
        typeof location.coordinates.lat !== 'number' || 
        typeof location.coordinates.lng !== 'number' ||
        isNaN(location.coordinates.lat) || 
        isNaN(location.coordinates.lng)) {
      console.error('Invalid coordinates:', location.coordinates);
      setError('Invalid location coordinates received');
      return;
    }
    
    // Create location object for map display
    const mapLocation = {
      name: location.area,
      lat: location.coordinates.lat,
      lng: location.coordinates.lng,
      score: prediction.priorityDetails.score,
      priority: prediction.priority,
      priorityColor: prediction.priorityDetails.color,
      priorityLevel: prediction.priorityDetails.level,
      features: satelliteData.features,
      landsatScene: satelliteData.landsatScene, // Include Landsat scene metadata
      query: result.query
    };

    // Add to search results (or replace if same location)
    setSearchResults(prev => {
      const filtered = prev.filter(loc => loc.query !== result.query);
      const updated = [...filtered, mapLocation];
      return updated;
    });

    // Center map on new location immediately (MapViewUpdater will handle timing)
    setMapCenter([location.coordinates.lat, location.coordinates.lng]);
    setMapZoom(13);

    // Notify parent component
    onLocationSelect(mapLocation);
  };

  const getPriorityColor = (priorityColor) => {
    const colors = {
      'green': '#22c55e',
      'yellow': '#eab308',
      'red': '#ef4444'
    };
    return colors[priorityColor] || '#6b7280';
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

  // Use search results if available, otherwise show no markers initially
  // Filter out any invalid locations
  const allMarkers = (searchResults.length > 0 ? searchResults : [])
    .filter(loc => loc && 
      typeof loc.lat === 'number' && 
      typeof loc.lng === 'number' && 
      !isNaN(loc.lat) && 
      !isNaN(loc.lng) &&
      loc.lat >= -90 && loc.lat <= 90 &&
      loc.lng >= -180 && loc.lng <= 180
    );
  
  // Debug: Log markers being rendered (commented out for production)
  // useEffect(() => {
  //   if (allMarkers.length > 0) {
  //     console.log('Map markers to render:', allMarkers.length, allMarkers);
  //   }
  // }, [allMarkers]);

  return (
    <div className="h-full relative rounded-lg overflow-hidden">
      {/* Search Bar */}
      <div className="absolute top-4 left-4 right-4 z-[1000]">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 z-10" />
          <input
            type="text"
            placeholder="Enter pincode or area name (e.g., Kattankulathur, 600042)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setError(null);
            }}
            disabled={isAnalyzing}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          />
          {isAnalyzing && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Loader2 className="w-5 h-5 text-primary-600 animate-spin" />
            </div>
          )}
        </form>
        
        {/* Analysis Progress */}
        {isAnalyzing && analysisStep && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-lg p-3 border border-gray-200 dark:border-gray-700 shadow-lg"
          >
            <p className="text-sm text-gray-700 dark:text-gray-300">{analysisStep}</p>
          </motion.div>
        )}
        
        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3"
          >
            <p className="text-sm text-red-700 dark:text-red-400 whitespace-pre-line">{error}</p>
          </motion.div>
        )}
      </div>

      {/* Leaflet Map */}
      <div className="h-full w-full" style={{ position: 'relative', zIndex: 0 }}>
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%', minHeight: '400px' }}
          scrollWheelZoom={true}
          className="rounded-lg"
        >
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Street Map">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Satellite Imagery">
              <TileLayer
                attribution='&copy; <a href="https://www.esri.com/">Esri</a>, Maxar, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, and the GIS User Community'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              />
            </LayersControl.BaseLayer>
          </LayersControl>
          
          {/* Update map view when center or zoom changes */}
          <MapViewUpdater center={mapCenter} zoom={mapZoom} />
          
          {/* Ensure markers are displayed properly */}
          <MarkerUpdater markerCount={allMarkers.length} />
          
          {/* Markers */}
          {allMarkers.map((location, index) => {
            // Validate location coordinates
            if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number' ||
                isNaN(location.lat) || isNaN(location.lng)) {
              console.warn('Invalid location data:', location);
              return null;
            }
            
            // Validate coordinate ranges
            if (location.lat < -90 || location.lat > 90 || location.lng < -180 || location.lng > 180) {
              console.warn('Location coordinates out of range:', location);
              return null;
            }
            
            const priorityColor = getPriorityColor(location.priorityColor);
            const icon = createPriorityIcon(priorityColor);
            
            return (
              <Marker
                key={location.query ? `search-${location.query}-${index}` : `marker-${location.name}-${index}`}
                position={[location.lat, location.lng]}
                icon={icon}
                eventHandlers={{
                  click: () => handleLocationClick(location),
                }}
              >
                <Popup className="custom-popup">
                  <div className="p-2 min-w-[200px]">
                    <h3 className="font-semibold text-gray-900 mb-2">{location.name}</h3>
                    <div className="space-y-1 text-sm">
                      <div>
                        <span className="text-gray-600">Priority: </span>
                        <span className={`font-semibold capitalize ${
                          location.priorityColor === 'green' ? 'text-green-600' :
                          location.priorityColor === 'yellow' ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {location.priorityLevel || 'N/A'} ({location.priority})
                        </span>
                    </div>
                      <div>
                        <span className="text-gray-600">Score: </span>
                        <span className="font-semibold text-gray-900">{location.score}/100</span>
                      </div>
                      {location.features && (
                        <>
                          <div>
                            <span className="text-gray-600">NDVI: </span>
                            <span className="font-semibold text-gray-900">
                              {location.features.ndvi?.toFixed(3) || 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">NDWI: </span>
                            <span className="font-semibold text-gray-900">
                              {location.features.ndwi?.toFixed(3) || 'N/A'}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => handleLocationClick(location)}
                      className="mt-3 w-full px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                    >
                      View Details
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
            </div>


            {/* Map Legend */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-lg">
        <h5 className="font-medium text-gray-900 dark:text-white mb-2">Planting Priority</h5>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-700 dark:text-gray-300">Green - High Priority</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-gray-700 dark:text-gray-300">Yellow - Medium Priority</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-700 dark:text-gray-300">Red - Low Priority</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg px-4 py-2 border border-gray-200 dark:border-gray-700 shadow-lg">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          💡 Enter a pincode or area name (e.g., "Kattankulathur") to analyze planting priority
        </p>
      </div>
    </div>
  );
};

export default MapComponent;
