import { motion } from 'framer-motion';
import { MapPin, TreePine, Users, Target, Star } from 'lucide-react';

const ZoneCard = ({ zone, rank }) => {
  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 bg-green-100 dark:bg-green-900/20';
    if (score >= 80) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
    if (score >= 70) return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
    return 'text-red-600 bg-red-100 dark:bg-red-900/20';
  };

  const getImpactColor = (impact) => {
    switch (impact.toLowerCase()) {
      case 'high': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      case 'low': return 'text-red-600 bg-red-100 dark:bg-red-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  return (
    <motion.div
      className="card hover:shadow-xl transition-all duration-300 group cursor-pointer"
      whileHover={{ scale: 1.02, y: -4 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: rank * 0.1 }}
    >
      {/* Header with Rank and Score */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              #{rank}
            </span>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${getScoreColor(zone.score)}`}>
            {zone.score}/100
          </div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getImpactColor(zone.impact)}`}>
          {zone.impact} Impact
        </div>
      </div>

      {/* Zone Name and Location */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {zone.name}
        </h3>
        <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{zone.location}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <TreePine className="w-5 h-5 text-primary-600 mx-auto mb-1" />
          <p className="text-sm font-medium text-gray-900 dark:text-white">{zone.trees}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Trees</p>
        </div>
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <Target className="w-5 h-5 text-primary-600 mx-auto mb-1" />
          <p className="text-sm font-medium text-gray-900 dark:text-white">{zone.area}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Area</p>
        </div>
      </div>

      {/* Benefits */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Key Benefits
        </h4>
        <div className="flex flex-wrap gap-1">
          {zone.benefits.map((benefit, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-xs rounded-full"
            >
              {benefit}
            </span>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <motion.button
        className="w-full btn-primary py-2 text-sm"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        View Details
      </motion.button>
    </motion.div>
  );
};

export default ZoneCard;
