import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TreePine, 
  MapPin, 
  BarChart3, 
  Users, 
  Settings, 
  Search, 
  Filter,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  TrendingUp,
  Droplets,
  Wind,
  Thermometer,
  Leaf,
  Target,
  CheckCircle
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import MapComponent from './MapComponent';
import ImpactCard from './ImpactCard';
import ZoneCard from './ZoneCard';
import AnalysisPanel from './AnalysisPanel';
import LocationHistory from './LocationHistory';
import BatchAnalysis from './BatchAnalysis';
import LocationComparison from './LocationComparison';

const Dashboard = () => {
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('planting-zones');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [impactData, setImpactData] = useState({
    carbonSequestration: 0,
    airQualityImprovement: 0,
    floodRiskReduction: 0,
    groundwaterRecharge: 0
  });

  // Mock data for ranked zones
  const rankedZones = [
    {
      id: 1,
      name: "Central Park Restoration",
      location: "New York, NY",
      score: 95,
      impact: "High",
      trees: 150,
      area: "2.5 acres",
      benefits: ["Flood Control", "Air Purification", "Wildlife Habitat"],
      coordinates: [40.7829, -73.9654]
    },
    {
      id: 2,
      name: "Riverside Green Corridor",
      location: "Los Angeles, CA",
      score: 88,
      impact: "High",
      trees: 200,
      area: "3.2 acres",
      benefits: ["Erosion Control", "Carbon Sequestration", "Urban Cooling"],
      coordinates: [34.0522, -118.2437]
    },
    {
      id: 3,
      name: "Community Forest Initiative",
      location: "Portland, OR",
      score: 82,
      impact: "Medium",
      trees: 120,
      area: "1.8 acres",
      benefits: ["Biodiversity", "Water Conservation", "Recreation"],
      coordinates: [45.5152, -122.6784]
    },
    {
      id: 4,
      name: "Urban Heat Island Mitigation",
      location: "Phoenix, AZ",
      score: 79,
      impact: "Medium",
      trees: 180,
      area: "2.1 acres",
      benefits: ["Temperature Reduction", "Energy Savings", "Air Quality"],
      coordinates: [33.4484, -112.0740]
    }
  ];

  const tabs = [
    { id: 'planting-zones', label: '🌳 Planting Zones', icon: TreePine },
    { id: 'batch-analysis', label: '📦 Batch Analysis', icon: BarChart3 },
    { id: 'impact-data', label: '📊 Impact Data', icon: BarChart3 },
    { id: 'contributions', label: '🧭 My Contributions', icon: Users },
    { id: 'settings', label: '⚙️ Settings', icon: Settings }
  ];

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    
    // Save to history
    if (location && location.features) {
      const historyItem = {
        ...location,
        id: `${location.query || location.name}-${Date.now()}`,
        timestamp: new Date().toISOString()
      };
      
      try {
        const existing = localStorage.getItem('locationHistory');
        const history = existing ? JSON.parse(existing) : [];
        // Remove duplicate if exists (same query)
        const filtered = history.filter(h => h.query !== location.query);
        // Add to beginning
        const updated = [historyItem, ...filtered].slice(0, 50); // Keep last 50
        localStorage.setItem('locationHistory', JSON.stringify(updated));
      } catch (error) {
        console.error('Failed to save to history:', error);
      }
    }
    
    // Calculate impact metrics based on priority and features
    if (location.features && location.priorityDetails) {
      const { features, priorityDetails } = location;
      
      // Higher priority (Green) areas get better impact estimates
      const priorityMultiplier = location.priority === 'Green' ? 1.5 : location.priority === 'Yellow' ? 1.0 : 0.6;
      
      // Use NDVI and other features to estimate impacts
      const ndviFactor = features.ndvi || 0.5;
      const vegetationFactor = features.vegetation_density || 0;
      
      setImpactData({
        carbonSequestration: Math.floor((50 - vegetationFactor) * priorityMultiplier * ndviFactor) + 15,
        airQualityImprovement: Math.floor((30 - vegetationFactor * 0.3) * priorityMultiplier) + 10,
        floodRiskReduction: Math.floor((features.ndwi || 0.3) * 100 * priorityMultiplier) + 15,
        groundwaterRecharge: Math.floor((features.soil_moisture || 0.3) * 100 * priorityMultiplier) + 15
      });
    } else {
      // Fallback for mock locations
      setImpactData({
        carbonSequestration: Math.floor(Math.random() * 50) + 20,
        airQualityImprovement: Math.floor(Math.random() * 30) + 15,
        floodRiskReduction: Math.floor(Math.random() * 40) + 25,
        groundwaterRecharge: Math.floor(Math.random() * 35) + 20
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    window.location.href = '/';
  };

  // Helper functions for data freshness
  const isDataFresh = (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const now = new Date();
    const daysDiff = (now - date) / (1000 * 60 * 60 * 24);
    return daysDiff <= 7; // Consider data fresh if less than 7 days old
  };

  const formatDataDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const now = new Date();
    const daysDiff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) return 'Today';
    if (daysDiff === 1) return 'Yesterday';
    if (daysDiff < 7) return `${daysDiff} days ago`;
    if (daysDiff < 30) return `${Math.floor(daysDiff / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-40">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            
            <div className="flex items-center space-x-2">
              <TreePine className="w-8 h-8 text-primary-600" />
              <span className="text-2xl font-bold text-primary-800 dark:text-white">
                ReforestAI
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Search Bar */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {isDark ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300"
            >
              <LogOut className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <AnimatePresence>
          {(sidebarOpen || window.innerWidth >= 1024) && (
            <motion.aside
              className="w-64 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-r border-gray-200/50 dark:border-gray-700/50 min-h-screen lg:relative absolute z-30"
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                  Navigation
                </h2>
                
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'planting-zones' && (
              <motion.div
                key="planting-zones"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Map Section */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                  <div className="xl:col-span-2">
                    <div className="card h-96">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          Interactive Map
                        </h3>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setActiveTab('batch-analysis')}
                              className="flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                            >
                              <span>Batch Analysis</span>
                            </button>
                            <button
                              onClick={() => setShowComparison(true)}
                              className="flex items-center space-x-2 px-4 py-2 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                            >
                              <span>Compare Locations</span>
                            </button>
                          </div>
                          <button className="flex items-center space-x-2 px-4 py-2 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors">
                            <Filter className="w-4 h-4" />
                            <span>Filters</span>
                          </button>
                        </div>
                      </div>
                      <div className="relative h-full" style={{ height: 'calc(100% - 4rem)' }}>
                        <MapComponent onLocationSelect={handleLocationSelect} />
                      </div>
                    </div>
                  </div>

                  {/* Impact Cards & Analysis Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Environmental Impact
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <ImpactCard
                        title="Carbon Sequestration"
                        value={`${impactData.carbonSequestration} tons/year`}
                        icon={Leaf}
                        color="green"
                        trend="+12%"
                      />
                      <ImpactCard
                        title="Air Quality"
                        value={`${impactData.airQualityImprovement}% improvement`}
                        icon={Wind}
                        color="blue"
                        trend="+8%"
                      />
                      <ImpactCard
                        title="Flood Risk"
                        value={`${impactData.floodRiskReduction}% reduction`}
                        icon={Droplets}
                        color="purple"
                        trend="+15%"
                      />
                      <ImpactCard
                        title="Groundwater"
                        value={`${impactData.groundwaterRecharge}% recharge`}
                        icon={Target}
                        color="orange"
                        trend="+6%"
                      />
                    </div>
                    
                    {/* Analysis Details */}
                    {selectedLocation && selectedLocation.features && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                            Satellite Analysis: {selectedLocation.name}
                          </h4>
                          <button
                            onClick={() => setShowAnalysisPanel(true)}
                            className="text-xs px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-1"
                          >
                            <BarChart3 className="w-3 h-3" />
                            <span>View Details</span>
                          </button>
                        </div>
                        
                        {/* Data Freshness Indicator */}
                        {selectedLocation.features.collection_date && (
                          <div className="mb-3 pb-3 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center space-x-2 text-xs">
                              <div className={`w-2 h-2 rounded-full ${
                                isDataFresh(selectedLocation.features.collection_date) 
                                  ? 'bg-green-500 animate-pulse' 
                                  : 'bg-yellow-500'
                              }`}></div>
                              <span className="text-gray-600 dark:text-gray-400">
                                Data from: <span className="font-semibold text-gray-900 dark:text-white">
                                  {formatDataDate(selectedLocation.features.collection_date)}
                                </span>
                              </span>
                            </div>
                          </div>
                        )}
                        
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Priority:</span>
                            <span className={`ml-2 font-semibold capitalize ${
                              selectedLocation.priorityColor === 'green' ? 'text-green-600' :
                              selectedLocation.priorityColor === 'yellow' ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {selectedLocation.priorityLevel} ({selectedLocation.priority})
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Score:</span>
                            <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                              {selectedLocation.score}/100
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">NDVI:</span>
                            <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                              {selectedLocation.features.ndvi.toFixed(3)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">NDWI:</span>
                            <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                              {selectedLocation.features.ndwi.toFixed(3)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Vegetation:</span>
                            <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                              {selectedLocation.features.vegetation_density?.toFixed(1) || 'N/A'}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Soil Moisture:</span>
                            <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                              {selectedLocation.features.soil_moisture?.toFixed(3) || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Ranked Zones */}
                <div className="card">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Top Ranked Planting Zones
                    </h3>
                    <button className="btn-primary">
                      Show My Impact Zone
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {rankedZones.map((zone, index) => (
                      <ZoneCard key={zone.id} zone={zone} rank={index + 1} />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'batch-analysis' && (
              <motion.div
                key="batch-analysis"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="card">
                  <BatchAnalysis
                    onResultsReady={(results) => {
                      // Handle batch results - could add markers to map or display in list
                      console.log('Batch analysis complete:', results);
                    }}
                  />
                </div>
              </motion.div>
            )}

            {activeTab === 'impact-data' && (
              <motion.div
                key="impact-data"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="card">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Environmental Impact Analytics
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
                      <TreePine className="w-12 h-12 text-green-600 mx-auto mb-4" />
                      <h4 className="text-2xl font-bold text-green-800 dark:text-green-300">1,247</h4>
                      <p className="text-green-600 dark:text-green-400">Trees Planted</p>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
                      <TrendingUp className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                      <h4 className="text-2xl font-bold text-blue-800 dark:text-blue-300">89.2</h4>
                      <p className="text-blue-600 dark:text-blue-400">Tons CO₂ Sequestered</p>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
                      <Droplets className="w-12 h-12 text-purple-600 mx-auto mb-4" />
                      <h4 className="text-2xl font-bold text-purple-800 dark:text-purple-300">156</h4>
                      <p className="text-purple-600 dark:text-purple-400">Gallons Water Saved</p>
                    </div>
                    <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl">
                      <Thermometer className="w-12 h-12 text-orange-600 mx-auto mb-4" />
                      <h4 className="text-2xl font-bold text-orange-800 dark:text-orange-300">3.2°C</h4>
                      <p className="text-orange-600 dark:text-orange-400">Temperature Reduction</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'contributions' && (
              <motion.div
                key="contributions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="card">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    My Contributions
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Central Park Restoration</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">50 trees planted • 2 weeks ago</p>
                        </div>
                      </div>
                      <span className="text-green-600 font-medium">+25 CO₂ tons</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <CheckCircle className="w-6 h-6 text-blue-600" />
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">Riverside Green Corridor</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">30 trees planted • 1 month ago</p>
                        </div>
                      </div>
                      <span className="text-blue-600 font-medium">+15 CO₂ tons</span>
                    </div>
                  </div>
                </div>

                {/* Location History */}
                <div className="card">
                  <LocationHistory
                    onSelectLocation={(location) => {
                      handleLocationSelect(location);
                      setActiveTab('planting-zones');
                    }}
                    onDeleteLocation={(locationId) => {
                      console.log('Deleted location:', locationId);
                    }}
                  />
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="card">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Settings
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Dark Mode</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Toggle between light and dark themes</p>
                      </div>
                      <button
                        onClick={toggleTheme}
                        className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors"
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            isDark ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">Notifications</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Receive updates about new planting opportunities</p>
                      </div>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary-600 transition-colors">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Analysis Panel Modal */}
      <AnimatePresence>
        {showAnalysisPanel && selectedLocation && (
          <AnalysisPanel
            location={selectedLocation}
            onClose={() => setShowAnalysisPanel(false)}
            onExport={(location) => {
              // TODO: Implement export functionality
              console.log('Exporting location data:', location);
            }}
          />
        )}
      </AnimatePresence>

      {/* Comparison Modal */}
      <AnimatePresence>
        {showComparison && (
          <LocationComparison
            onClose={() => setShowComparison(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
