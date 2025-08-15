import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Target, Shield } from 'lucide-react';
import { AnalysisResult } from '../types';

interface TechnicalAnalysisProps {
  analysis: AnalysisResult;
}

const TechnicalAnalysis: React.FC<TechnicalAnalysisProps> = ({ analysis }) => {
  const getTrendIcon = () => {
    switch (analysis.trend) {
      case 'bullish': return <TrendingUp className="h-5 w-5 text-green-400" />;
      case 'bearish': return <TrendingDown className="h-5 w-5 text-red-400" />;
      default: return <Minus className="h-5 w-5 text-gray-400" />;
    }
  };

  const getTrendColor = () => {
    switch (analysis.trend) {
      case 'bullish': return 'text-green-400';
      case 'bearish': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getTrendBg = () => {
    switch (analysis.trend) {
      case 'bullish': return 'bg-green-500/20 border-green-500';
      case 'bearish': return 'bg-red-500/20 border-red-500';
      default: return 'bg-gray-500/20 border-gray-500';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-lg p-6"
    >
      <h3 className="text-lg font-bold mb-4">Technical Analysis</h3>
      
      {/* Overall Trend */}
      <div className={`border rounded-lg p-4 mb-4 ${getTrendBg()}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {getTrendIcon()}
            <span className={`font-bold text-lg capitalize ${getTrendColor()}`}>
              {analysis.trend}
            </span>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Strength</div>
            <div className="font-bold">{analysis.strength.toFixed(0)}/100</div>
          </div>
        </div>
        
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              analysis.trend === 'bullish' ? 'bg-green-400' :
              analysis.trend === 'bearish' ? 'bg-red-400' : 'bg-gray-400'
            }`}
            style={{ width: `${analysis.strength}%` }}
          />
        </div>
      </div>

      {/* Price Targets */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-700 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Target className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-gray-400">Target</span>
          </div>
          <div className="text-lg font-bold text-blue-400">
            ${analysis.nextTarget.toFixed(2)}
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Shield className="h-4 w-4 text-red-400" />
            <span className="text-sm text-gray-400">Stop Loss</span>
          </div>
          <div className="text-lg font-bold text-red-400">
            ${analysis.stopLoss.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Confidence Score */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">AI Confidence</span>
          <span className="text-sm font-bold">{(analysis.confidence * 100).toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-purple-400 h-2 rounded-full"
            style={{ width: `${analysis.confidence * 100}%` }}
          />
        </div>
      </div>

      {/* Trading Signals */}
      <div>
        <h4 className="text-sm font-bold text-gray-400 mb-2">Trading Signals</h4>
        <div className="space-y-2">
          {analysis.signals.map((signal, index) => (
            <div
              key={index}
              className="bg-gray-700 rounded p-2 text-sm"
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                <span>{signal}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        * Analysis based on technical indicators and AI pattern recognition
      </div>
    </motion.div>
  );
};

export default TechnicalAnalysis;