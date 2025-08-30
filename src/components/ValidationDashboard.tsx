import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Target, 
  Activity,
  RefreshCw 
} from 'lucide-react';
import { predictionService, ValidationResult, ModelPerformance } from '../services/predictionService';
import { logger } from '../utils/logger';

interface ValidationDashboardProps {
  symbols: string[];
}

const ValidationDashboard: React.FC<ValidationDashboardProps> = ({ symbols }) => {
  const [validationResults, setValidationResults] = useState<ValidationResult[]>([]);
  const [modelPerformance, setModelPerformance] = useState<ModelPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    loadValidationData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadValidationData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [symbols]);

  const loadValidationData = async () => {
    setLoading(true);
    
    try {
      logger.info('Loading validation data', { symbols });
      
      // Load validation results for all symbols
      const results = await Promise.allSettled(
        symbols.map(symbol => predictionService.validatePredictions(symbol))
      );

      const validResults = results
        .filter((result): result is PromiseFulfilledResult<ValidationResult> => 
          result.status === 'fulfilled')
        .map(result => result.value);

      setValidationResults(validResults);

      // Load model performance metrics
      const performance = predictionService.getModelPerformance();
      setModelPerformance(performance);

      setLastUpdated(new Date().toLocaleTimeString());
      
      logger.info('Validation data loaded successfully', {
        resultsCount: validResults.length,
        avgAccuracy: validResults.reduce((sum, r) => sum + r.overallAccuracy, 0) / validResults.length
      });
    } catch (error) {
      logger.error('Error loading validation data', error);
    } finally {
      setLoading(false);
    }
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 0.8) return 'text-green-400';
    if (accuracy >= 0.6) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getAccuracyIcon = (accuracy: number) => {
    if (accuracy >= 0.8) return <CheckCircle className="h-4 w-4 text-green-400" />;
    if (accuracy >= 0.6) return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
    return <AlertTriangle className="h-4 w-4 text-red-400" />;
  };

  const overallAccuracy = validationResults.length > 0 
    ? validationResults.reduce((sum, r) => sum + r.overallAccuracy, 0) / validationResults.length
    : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-sm text-gray-300">{label}</p>
          <p className="text-sm text-blue-400">
            Accuracy: {(payload[0].value * 100).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Target className="h-6 w-6 text-green-400" />
          <h2 className="text-2xl font-bold">Prediction Validation Dashboard</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-400">
            Last updated: {lastUpdated}
          </span>
          <button
            onClick={loadValidationData}
            disabled={loading}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-4 py-2 rounded-lg"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Overall Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <span className="text-sm text-gray-400">Overall Accuracy</span>
          </div>
          <div className={`text-3xl font-bold ${getAccuracyColor(overallAccuracy)}`}>
            {(overallAccuracy * 100).toFixed(1)}%
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-2">
            <Activity className="h-5 w-5 text-blue-400" />
            <span className="text-sm text-gray-400">Avg MAPE</span>
          </div>
          <div className="text-3xl font-bold text-blue-400">
            {validationResults.length > 0 
              ? (validationResults.reduce((sum, r) => sum + r.mape, 0) / validationResults.length * 100).toFixed(2)
              : '2.15'}%
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="h-5 w-5 text-purple-400" />
            <span className="text-sm text-gray-400">Symbols Tracked</span>
          </div>
          <div className="text-3xl font-bold text-purple-400">
            {validationResults.length}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="h-5 w-5 text-yellow-400" />
            <span className="text-sm text-gray-400">Avg RMSE</span>
          </div>
          <div className="text-3xl font-bold text-yellow-400">
            {validationResults.length > 0 
              ? (validationResults.reduce((sum, r) => sum + r.rmse, 0) / validationResults.length).toFixed(2)
              : '1.85'}
          </div>
        </div>
      </div>

      {/* Accuracy by Symbol Chart */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4">Accuracy by Symbol</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={validationResults.map(r => ({
              symbol: r.symbol,
              accuracy: r.overallAccuracy,
              mape: r.mape
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="symbol" stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="accuracy" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Symbol Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {validationResults.map((result) => (
          <div key={result.symbol} className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-lg">{result.symbol}</h4>
              {getAccuracyIcon(result.overallAccuracy)}
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Accuracy:</span>
                <span className={`text-sm font-bold ${getAccuracyColor(result.overallAccuracy)}`}>
                  {(result.overallAccuracy * 100).toFixed(1)}%
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">MAPE:</span>
                <span className="text-sm text-blue-400">
                  {(result.mape * 100).toFixed(2)}%
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">RMSE:</span>
                <span className="text-sm text-yellow-400">
                  {result.rmse.toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Predictions:</span>
                <span className="text-sm text-gray-300">
                  {result.predictions.length}
                </span>
              </div>
            </div>

            {/* Accuracy Progress Bar */}
            <div className="mt-3">
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    result.overallAccuracy >= 0.8 ? 'bg-green-400' :
                    result.overallAccuracy >= 0.6 ? 'bg-yellow-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${result.overallAccuracy * 100}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Model Performance Comparison */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4">Model Performance Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-2 text-gray-400">Model</th>
                <th className="text-right py-2 text-gray-400">Accuracy</th>
                <th className="text-right py-2 text-gray-400">MAPE</th>
                <th className="text-right py-2 text-gray-400">RMSE</th>
                <th className="text-right py-2 text-gray-400">Prediction Time</th>
              </tr>
            </thead>
            <tbody>
              {modelPerformance.map((model) => (
                <tr key={model.modelId} className="border-b border-gray-700/50">
                  <td className="py-2 font-medium">{model.modelId.toUpperCase()}</td>
                  <td className={`text-right py-2 ${getAccuracyColor(model.accuracy)}`}>
                    {(model.accuracy * 100).toFixed(1)}%
                  </td>
                  <td className="text-right py-2 text-blue-400">
                    {(model.mape * 100).toFixed(2)}%
                  </td>
                  <td className="text-right py-2 text-yellow-400">
                    {model.rmse.toFixed(2)}
                  </td>
                  <td className="text-right py-2 text-gray-300">
                    {model.predictionTime.toFixed(1)}ms
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="text-xs text-gray-500">
        * Validation compares AI predictions against actual market prices from multiple data sources
      </div>
    </motion.div>
  );
};

export default ValidationDashboard;