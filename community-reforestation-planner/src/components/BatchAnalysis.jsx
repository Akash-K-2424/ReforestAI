import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash2, Loader2, CheckCircle, AlertCircle, MapPin } from 'lucide-react';
import { analyzeLocationsBatch } from '../services/api';

const BatchAnalysis = ({ onResultsReady }) => {
  const [locations, setLocations] = useState(['']);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);

  const handleInputChange = (index, value) => {
    const newLocations = [...locations];
    newLocations[index] = value;
    setLocations(newLocations);
    setError(null);
  };

  const addLocation = () => {
    setLocations([...locations, '']);
  };

  const removeLocation = (index) => {
    if (locations.length > 1) {
      const newLocations = locations.filter((_, i) => i !== index);
      setLocations(newLocations);
    }
  };

  const handleAnalyze = async () => {
    const validLocations = locations.filter(loc => loc.trim());
    
    if (validLocations.length === 0) {
      setError('Please enter at least one location');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResults([]);

    try {
      const analysisResults = await analyzeLocationsBatch(validLocations);
      
      const processedResults = analysisResults.map((result, index) => ({
        ...result,
        originalQuery: validLocations[index],
        id: `batch-${index}-${Date.now()}`
      }));

      setResults(processedResults);
      
      if (onResultsReady) {
        onResultsReady(processedResults.filter(r => r.success));
      }
    } catch (err) {
      console.error('Batch analysis error:', err);
      setError(err.message || 'Failed to analyze locations');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Batch Location Analysis
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Analyze multiple pincodes or locations at once
        </p>
      </div>

      {/* Input Fields */}
      <div className="space-y-3">
        {locations.map((location, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={`Location ${index + 1} (pincode or area name)`}
                value={location}
                onChange={(e) => handleInputChange(index, e.target.value)}
                disabled={isAnalyzing}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50"
              />
            </div>
            {locations.length > 1 && (
              <button
                onClick={() => removeLocation(index)}
                disabled={isAnalyzing}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            )}
          </div>
        ))}

        <button
          onClick={addLocation}
          disabled={isAnalyzing}
          className="flex items-center space-x-2 px-4 py-2 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors disabled:opacity-50"
        >
          <Plus className="w-4 h-4" />
          <span>Add Location</span>
        </button>
      </div>

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={isAnalyzing || locations.filter(l => l.trim()).length === 0}
        className="w-full px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Analyzing {locations.filter(l => l.trim()).length} locations...</span>
          </>
        ) : (
          <span>Analyze All Locations</span>
        )}
      </button>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
        >
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-semibold">{successCount}</span> successful
                </span>
              </div>
              {failureCount > 0 && (
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-semibold">{failureCount}</span> failed
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            <AnimatePresence>
              {results.map((result, index) => (
                <motion.div
                  key={result.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className={`p-4 rounded-lg border ${
                    result.success
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {result.success ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-600" />
                        )}
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {result.originalQuery || result.query}
                        </h4>
                      </div>
                      {result.success ? (
                        <div className="ml-7 space-y-1 text-sm">
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Location: </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {result.location?.area || 'N/A'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Priority: </span>
                            <span className={`font-semibold capitalize ${
                              result.prediction?.priorityDetails?.color === 'green' ? 'text-green-600' :
                              result.prediction?.priorityDetails?.color === 'yellow' ? 'text-yellow-600' :
                              'text-red-600'
                            }`}>
                              {result.prediction?.priorityDetails?.level || 'N/A'} ({result.prediction?.priority || 'N/A'})
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600 dark:text-gray-400">Score: </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {result.prediction?.priorityDetails?.score || 'N/A'}/100
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="ml-7">
                          <p className="text-sm text-red-700 dark:text-red-400">
                            {result.error || 'Analysis failed'}
                          </p>
                          {result.suggestion && (
                            <p className="text-xs text-red-600 dark:text-red-500 mt-1">
                              💡 {result.suggestion}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default BatchAnalysis;

