import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const ImpactCard = ({ title, value, icon: Icon, color, trend }) => {
  const colorClasses = {
    green: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 text-green-600 dark:text-green-400',
    blue: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 text-blue-600 dark:text-blue-400',
    purple: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 text-purple-600 dark:text-purple-400',
    orange: 'from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 text-orange-600 dark:text-orange-400',
    red: 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 text-red-600 dark:text-red-400'
  };

  const isPositiveTrend = trend && trend.startsWith('+');

  return (
    <motion.div
      className={`p-4 rounded-xl bg-gradient-to-br ${colorClasses[color]} hover:shadow-lg transition-all duration-300`}
      whileHover={{ scale: 1.02, y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-3">
        <Icon className="w-8 h-8" />
        {trend && (
          <div className={`flex items-center space-x-1 text-sm font-medium ${
            isPositiveTrend ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {isPositiveTrend ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span>{trend}</span>
          </div>
        )}
      </div>
      
      <div>
        <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
          {title}
        </h4>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
      </div>
    </motion.div>
  );
};

export default ImpactCard;
