import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, TrendingUp, TrendingDown, Minus, MapPin, Search } from 'lucide-react';
import { analyzeLocation } from '../services/api';

const LocationComparison = ({ onClose }) => {
  const [location1Query, setLocation1Query] = useState('');
  const [location2Query, setLocation2Query] = useState('');
  const [location1Data, setLocation1Data] = useState(null);
  const [location2Data, setLocation2Data] = useState(null);
  const [isLoading1, setIsLoading1] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [error1, setError1] = useState(null);
  const [error2, setError2] = useState(null);

  const handleAnalyze = async (locationNumber) => {
    const query = locationNumber === 1 ? location1Query : location2Query;
    
    if (!query.trim()) {
      if (locationNumber === 1) {
        setError1('Please enter a location');
      } else {
        setError2('Please enter a location');
      }
      return;
    }

    if (locationNumber === 1) {
      setIsLoading1(true);
      setError1(null);
    } else {
      setIsLoading2(true);
      setError2(null);
    }

    try {
      const result = await analyzeLocation(query);
      
      if (result.success) {
        if (locationNumber === 1) {
          setLocation1Data(result);
        } else {
          setLocation2Data(result);
        }
      } else {
        if (locationNumber === 1) {
          setError1(result.error || 'Analysis failed');
        } else {
          setError2(result.error || 'Analysis failed');
        }
      }
    } catch (err) {
      if (locationNumber === 1) {
        setError1(err.message || 'Failed to analyze location');
      } else {
        setError2(err.message || 'Failed to analyze location');
      }
    } finally {
      if (locationNumber === 1) {
        setIsLoading1(false);
      } else {
        setIsLoading2(false);
      }
    }
  };

  const getComparison = (metric, higherIsBetter = true) => {
    if (!location1Data || !location2Data) return null;
    
    const val1 = getNestedValue(location1Data, metric);
    const val2 = getNestedValue(location2Data, metric);
    
    if (val1 === null || val2 === null) return null;
    
    const diff = val1 - val2;
    const percentDiff = val2 !== 0 ? ((diff / val2) * 100).toFixed(1) : 'N/A';
    
    if (diff === 0) return { icon: Minus, color: 'text-gray-500', text: 'Equal' };
    if ((higherIsBetter && diff > 0) || (!higherIsBetter && diff < 0)) {
      return { icon: TrendingUp, color: 'text-green-600', text: `${Math.abs(percentDiff)}% better` };
    }
    return { icon: TrendingDown, color: 'text-red-600', text: `${Math.abs(percentDiff)}% worse` };
  };

  const getNestedValue = (data, path) => {
    const keys = path.split('.');
    let value = data;
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key];
      } else {
        return null;
      }
    }
    return value;
  };

  const ComparisonRow = ({ label, metric, format = (v) => v, higherIsBetter = true }) => {
    const val1 = location1Data ? getNestedValue(location1Data, metric) : null;
    const val2 = location2Data ? getNestedValue(location2Data, metric) : null;
    const comparison = getComparison(metric, higherIsBetter);

    return (
      <div className="grid grid-cols-5 gap-4 py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
        <div className="font-medium text-gray-700 dark:text-gray-300 text-sm">{label}</div>
        <div className="text-center">
          <div className="font-semibold text-gray-900 dark:text-white">
            {val1 !== null ? format(val1) : 'N/A'}
          </div>
        </div>
        <div className="text-center flex items-center justify-center">
          {comparison && (
            <div className={`flex items-center space-x-1 ${comparison.color}`}>
              <comparison.icon className="w-4 h-4" />
              <span className="text-xs">{comparison.text}</span>
            </div>
          )}
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-900 dark:text-white">
            {val2 !== null ? format(val2) : 'N/A'}
          </div>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-500">
          {comparison && comparison.text !== 'Equal' && (
            <span className={comparison.color}>
              Location {comparison.text.includes('better') ? '1' : '2'} preferred
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
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
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                Location Comparison
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Compare two locations side-by-side
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Input Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location 1 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                  1
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Location 1</h3>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Enter pincode or area name..."
                  value={location1Query}
                  onChange={(e) => setLocation1Query(e.target.value)}
                  disabled={isLoading1}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
                />
              </div>
              
              <button
                onClick={() => handleAnalyze(1)}
                disabled={isLoading1 || !location1Query.trim()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading1 ? 'Analyzing...' : 'Analyze Location 1'}
              </button>
              
              {error1 && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-400">{error1}</p>
                </div>
              )}
              
              {location1Data && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="w-4 h-4 text-blue-600" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {location1Data.location?.area || 'N/A'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Priority: <span className="font-semibold text-gray-900 dark:text-white">
                      {location1Data.prediction?.priorityDetails?.level || 'N/A'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Location 2 */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center font-bold">
                  2
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Location 2</h3>
              </div>
              
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Enter pincode or area name..."
                  value={location2Query}
                  onChange={(e) => setLocation2Query(e.target.value)}
                  disabled={isLoading2}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
                />
              </div>
              
              <button
                onClick={() => handleAnalyze(2)}
                disabled={isLoading2 || !location2Query.trim()}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading2 ? 'Analyzing...' : 'Analyze Location 2'}
              </button>
              
              {error2 && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-700 dark:text-red-400">{error2}</p>
                </div>
              )}
              
              {location2Data && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {location2Data.location?.area || 'N/A'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Priority: <span className="font-semibold text-gray-900 dark:text-white">
                      {location2Data.prediction?.priorityDetails?.level || 'N/A'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comparison Table */}
          {location1Data && location2Data && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Detailed Comparison
              </h3>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
                <div className="grid grid-cols-5 gap-4 pb-2 border-b-2 border-gray-300 dark:border-gray-600 font-semibold text-gray-900 dark:text-white">
                  <div>Metric</div>
                  <div className="text-center">Location 1</div>
                  <div className="text-center">Comparison</div>
                  <div className="text-center">Location 2</div>
                  <div>Winner</div>
                </div>
                
                <ComparisonRow
                  label="Priority Score"
                  metric="prediction.priorityDetails.score"
                  format={(v) => `${v}/100`}
                />
                <ComparisonRow
                  label="NDVI (Vegetation)"
                  metric="satelliteData.features.ndvi"
                  format={(v) => v?.toFixed(3) || 'N/A'}
                />
                <ComparisonRow
                  label="NDWI (Water)"
                  metric="satelliteData.features.ndwi"
                  format={(v) => v?.toFixed(3) || 'N/A'}
                />
                <ComparisonRow
                  label="Vegetation Density"
                  metric="satelliteData.features.vegetation_density"
                  format={(v) => `${v?.toFixed(1)}%` || 'N/A'}
                  higherIsBetter={false}
                />
                <ComparisonRow
                  label="Soil Moisture"
                  metric="satelliteData.features.soil_moisture"
                  format={(v) => `${(v * 100).toFixed(1)}%` || 'N/A'}
                />
                <ComparisonRow
                  label="Elevation"
                  metric="satelliteData.features.elevation"
                  format={(v) => `${v?.toFixed(1)} m` || 'N/A'}
                  higherIsBetter={false}
                />
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LocationComparison;

