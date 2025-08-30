import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { predictionService } from '../services/predictionService';
import { logger } from '../utils/logger';

interface RealTimeValidatorProps {
  symbols: string[];
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface ValidationStatus {
  symbol: string;
  currentPrice: number;
  predictedPrice: number;
  accuracy: number;
  status: 'accurate' | 'warning' | 'poor';
  lastUpdated: string;
  trend: 'up' | 'down' | 'stable';
}

const RealTimeValidator: React.FC<RealTimeValidatorProps> = ({ 
  symbols, 
  autoRefresh = true, 
  refreshInterval = 30000 
}) => {
  const [validationStatuses, setValidationStatuses] = useState<ValidationStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<string>('');

  useEffect(() => {
    validateRealTime();
    
    if (autoRefresh) {
      const interval = setInterval(validateRealTime, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [symbols, autoRefresh, refreshInterval]);

  const validateRealTime = async () => {
    setLoading(true);
    
    try {
      logger.info('Starting real-time validation', { symbols });
      
      const validationPromises = symbols.map(async (symbol) => {
        try {
          // Get current market price
          const realTimeData = await predictionService.getRealTimeMarketData(symbol);
          
          // Get latest prediction
          const predictions = await predictionService.generateEnhancedPredictions(symbol, 1);
          const latestPrediction = predictions[0];
          
          if (!latestPrediction) {
            throw new Error(`No predictions available for ${symbol}`);
          }

          // Calculate accuracy
          const error = Math.abs(realTimeData.price - latestPrediction.predicted) / realTimeData.price;
          const accuracy = Math.max(0, 1 - error);
          
          // Determine status
          let status: 'accurate' | 'warning' | 'poor';
          if (accuracy >= 0.95) status = 'accurate';
          else if (accuracy >= 0.85) status = 'warning';
          else status = 'poor';

          // Determine trend
          const priceDiff = realTimeData.price - latestPrediction.predicted;
          let trend: 'up' | 'down' | 'stable';
          if (Math.abs(priceDiff) < realTimeData.price * 0.001) trend = 'stable';
          else if (priceDiff > 0) trend = 'up';
          else trend = 'down';

          return {
            symbol,
            currentPrice: realTimeData.price,
            predictedPrice: latestPrediction.predicted,
            accuracy,
            status,
            lastUpdated: realTimeData.timestamp,
            trend
          };
        } catch (error) {
          logger.error(`Error validating ${symbol}`, error);
          return null;
        }
      });

      const results = await Promise.all(validationPromises);
      const validResults = results.filter((result): result is ValidationStatus => result !== null);
      
      setValidationStatuses(validResults);
      setLastRefresh(new Date().toLocaleTimeString());
      
      logger.info('Real-time validation completed', {
        validated: validResults.length,
        avgAccuracy: validResults.reduce((sum, r) => sum + r.accuracy, 0) / validResults.length
      });
    } catch (error) {
      logger.error('Error in real-time validation', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accurate': return 'text-green-400 bg-green-500/20 border-green-500';
      case 'warning': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500';
      case 'poor': return 'text-red-400 bg-red-500/20 border-red-500';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accurate': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <Clock className="h-4 w-4" />;
      case 'poor': return <XCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-400" />;
      default: return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-800 rounded-lg p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Activity className="h-6 w-6 text-blue-400" />
          <h3 className="text-xl font-bold">Real-Time Validation</h3>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-400">
            Last refresh: {lastRefresh}
          </span>
          <button
            onClick={validateRealTime}
            disabled={loading}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-3 py-2 rounded-lg text-sm"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Validation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {validationStatuses.map((status) => (
          <motion.div
            key={status.symbol}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`border rounded-lg p-4 ${getStatusColor(status.status)}`}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-lg">{status.symbol}</h4>
              <div className="flex items-center space-x-2">
                {getStatusIcon(status.status)}
                {getTrendIcon(status.trend)}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Current Price:</span>
                <span className="text-sm font-bold">
                  ${status.currentPrice.toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Predicted:</span>
                <span className="text-sm font-bold text-purple-400">
                  ${status.predictedPrice.toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Accuracy:</span>
                <span className={`text-sm font-bold ${
                  status.accuracy >= 0.95 ? 'text-green-400' :
                  status.accuracy >= 0.85 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {(status.accuracy * 100).toFixed(1)}%
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Difference:</span>
                <span className={`text-sm font-bold ${
                  Math.abs(status.currentPrice - status.predictedPrice) < status.currentPrice * 0.02 
                    ? 'text-green-400' : 'text-red-400'
                }`}>
                  ${Math.abs(status.currentPrice - status.predictedPrice).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Accuracy Progress Bar */}
            <div className="mt-3">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    status.accuracy >= 0.95 ? 'bg-green-400' :
                    status.accuracy >= 0.85 ? 'bg-yellow-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${status.accuracy * 100}%` }}
                />
              </div>
            </div>

            <div className="text-xs text-gray-500 mt-2">
              Updated: {new Date(status.lastUpdated).toLocaleTimeString()}
            </div>
          </motion.div>
        ))}
      </div>

      {loading && validationStatuses.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 text-blue-400 animate-spin mx-auto mb-2" />
            <p className="text-gray-400">Validating predictions...</p>
          </div>
        </div>
      )}

      <div className="mt-6 text-xs text-gray-500">
        * Real-time validation compares AI predictions with live market data from multiple sources
      </div>
    </motion.div>
  );
};

export default RealTimeValidator;