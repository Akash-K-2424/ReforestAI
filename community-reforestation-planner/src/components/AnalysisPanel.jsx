import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, TrendingUp, TrendingDown, Leaf, Droplets, BarChart3, FileText, FileJson, FileSpreadsheet, CheckCircle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { exportToCSV, exportToJSON, exportToText } from '../services/exportService';

const AnalysisPanel = ({ location, onClose, onExport }) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const exportMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setShowExportMenu(false);
      }
    };

    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showExportMenu]);

  if (!location || !location.features) {
    return null;
  }

  const handleExport = async (format) => {
    try {
      setExportSuccess(false);
      switch (format) {
        case 'csv':
          exportToCSV(location);
          break;
        case 'json':
          exportToJSON(location);
          break;
        case 'txt':
          exportToText(location);
          break;
        default:
          return;
      }
      setExportSuccess(true);
      setShowExportMenu(false);
      setTimeout(() => setExportSuccess(false), 3000);
      if (onExport) onExport(location);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed: ' + error.message);
    }
  };

  const { features, score, priority, priorityColor, priorityLevel } = location;

  // Generate historical trend data (mock - in production, this would come from backend)
  const generateHistoricalData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const baseNDVI = features.ndvi || 0.5;
    const baseNDWI = features.ndwi || 0.3;
    
    return months.map((month, index) => ({
      month,
      NDVI: Math.max(0, Math.min(1, baseNDVI + (Math.sin(index * 0.5) * 0.15) + (Math.random() * 0.1 - 0.05))),
      NDWI: Math.max(0, Math.min(1, baseNDWI + (Math.cos(index * 0.5) * 0.1) + (Math.random() * 0.08 - 0.04))),
    }));
  };

  const historicalData = generateHistoricalData();

  // Feature comparison data for radar chart
  const featureData = [
    {
      feature: 'NDVI',
      value: ((features.ndvi + 1) / 2) * 100, // Normalize from -1 to 1, scale to 0-100
      fullMark: 100,
    },
    {
      feature: 'NDWI',
      value: ((features.ndwi + 1) / 2) * 100,
      fullMark: 100,
    },
    {
      feature: 'Vegetation',
      value: features.vegetation_density || 0,
      fullMark: 100,
    },
    {
      feature: 'Soil Moisture',
      value: (features.soil_moisture || 0) * 100,
      fullMark: 100,
    },
    {
      feature: 'Priority Score',
      value: score || 0,
      fullMark: 100,
    },
  ];

  // Priority color mapping
  const priorityColors = {
    green: '#22c55e',
    yellow: '#eab308',
    red: '#ef4444',
  };

  const priorityBgColors = {
    green: 'bg-green-50 dark:bg-green-900/20',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20',
    red: 'bg-red-50 dark:bg-red-900/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`${priorityBgColors[priorityColor] || 'bg-gray-50 dark:bg-gray-700'} p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 backdrop-blur-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {location.name}
              </h2>
              <div className="flex items-center space-x-4 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  priorityColor === 'green' ? 'bg-green-500 text-white' :
                  priorityColor === 'yellow' ? 'bg-yellow-500 text-white' :
                  'bg-red-500 text-white'
                }`}>
                  {priorityLevel} Priority ({priority})
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Score: <span className="font-semibold text-gray-900 dark:text-white">{score}/100</span>
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative" ref={exportMenuRef}>
                <button
                  onClick={() => setShowExportMenu(!showExportMenu)}
                  className="p-2 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors relative"
                  title="Export Data"
                >
                  <Download className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  {exportSuccess && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></span>
                  )}
                </button>
                
                {/* Export Menu */}
                <AnimatePresence>
                  {showExportMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 z-50"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="p-2">
                        <button
                          onClick={() => handleExport('csv')}
                          className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left"
                        >
                          <FileSpreadsheet className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Export as CSV</span>
                        </button>
                        <button
                          onClick={() => handleExport('json')}
                          className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left"
                        >
                          <FileJson className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Export as JSON</span>
                        </button>
                        <button
                          onClick={() => handleExport('txt')}
                          className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-left"
                        >
                          <FileText className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Export as Text</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              {exportSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center space-x-1 text-green-600 dark:text-green-400 text-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Exported!</span>
                </motion.div>
              )}
              
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Leaf className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">NDVI</span>
              </div>
              <div className="text-2xl font-bold text-green-800 dark:text-green-300">
                {features.ndvi?.toFixed(3) || 'N/A'}
              </div>
              <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                Vegetation Index
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Droplets className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">NDWI</span>
              </div>
              <div className="text-2xl font-bold text-blue-800 dark:text-blue-300">
                {features.ndwi?.toFixed(3) || 'N/A'}
              </div>
              <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Water Index
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Vegetation</span>
              </div>
              <div className="text-2xl font-bold text-purple-800 dark:text-purple-300">
                {features.vegetation_density?.toFixed(1) || 'N/A'}%
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                Density
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Droplets className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Soil Moisture</span>
              </div>
              <div className="text-2xl font-bold text-orange-800 dark:text-orange-300">
                {(features.soil_moisture * 100)?.toFixed(1) || 'N/A'}%
              </div>
              <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                Moisture Level
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Historical Trends */}
            <div className="bg-white dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Historical Trends (12 Months)</span>
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={historicalData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#6b7280"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    domain={[0, 1]}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="NDVI" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    dot={{ fill: '#22c55e', r: 4 }}
                    name="NDVI (Vegetation)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="NDWI" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 4 }}
                    name="NDWI (Water)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Feature Radar Chart */}
            <div className="bg-white dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Feature Analysis</span>
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <RadarChart data={featureData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis 
                    dataKey="feature" 
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]}
                    tick={{ fill: '#6b7280', fontSize: 10 }}
                  />
                  <Radar
                    name="Values"
                    dataKey="value"
                    stroke={priorityColors[priorityColor] || '#6366f1'}
                    fill={priorityColors[priorityColor] || '#6366f1'}
                    fillOpacity={0.6}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Additional Information */}
          <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Additional Details
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Elevation:</span>
                <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                  {features.elevation?.toFixed(1) || 'N/A'} m
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Land Use:</span>
                <span className="ml-2 font-semibold text-gray-900 dark:text-white capitalize">
                  {features.land_use_type || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Data Source:</span>
                <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                  {features.data_source || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Collection Date:</span>
                <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                  {features.collection_date || 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Resolution:</span>
                <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                  {features.grid_resolution || 'N/A'}
                </span>
              </div>
              {location.landsatScene && (
                <>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Landsat Scene ID:</span>
                    <span className="ml-2 font-semibold text-gray-900 dark:text-white text-xs">
                      {location.landsatScene.sceneId || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Cloud Cover:</span>
                    <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                      {location.landsatScene.cloudCover || 'N/A'}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Days Since Acquisition:</span>
                    <span className="ml-2 font-semibold text-gray-900 dark:text-white">
                      {location.landsatScene.daysSinceAcquisition || 'N/A'} days
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AnalysisPanel;

