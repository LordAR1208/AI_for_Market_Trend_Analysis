import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, TrendingUp, Settings, Play, RotateCcw } from 'lucide-react';

interface ManualPredictionParams {
  currentPrice: number;
  rsi: number;
  macd: number;
  volume: number;
  volatility: number;
  marketSentiment: number;
  economicIndicator: number;
  timeHorizon: number;
}

interface ManualPredictionResult {
  predictedPrice: number;
  confidence: number;
  priceChange: number;
  priceChangePercent: number;
  riskLevel: 'Low' | 'Medium' | 'High';
}

interface ManualPredictionPanelProps {
  symbol: string;
  currentPrice: number;
}

const ManualPredictionPanel: React.FC<ManualPredictionPanelProps> = ({ symbol, currentPrice }) => {
  const [params, setParams] = useState<ManualPredictionParams>({
    currentPrice: currentPrice || getUpdated2025Price(symbol),
    rsi: 50,
    macd: 0,
    volume: 1000000,
    volatility: 0.02,
    marketSentiment: 0,
    economicIndicator: 0,
    timeHorizon: 7
  });

  const [result, setResult] = useState<ManualPredictionResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleParamChange = (param: keyof ManualPredictionParams, value: number) => {
    setParams(prev => ({
      ...prev,
      [param]: value
    }));
  };

  const calculatePrediction = async () => {
    setIsCalculating(true);
    
    // Simulate calculation delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Advanced prediction algorithm based on input parameters
    const {
      currentPrice,
      rsi,
      macd,
      volume,
      volatility,
      marketSentiment,
      economicIndicator,
      timeHorizon
    } = params;

    // RSI influence (oversold/overbought conditions)
    let rsiInfluence = 0;
    if (rsi < 30) rsiInfluence = 0.02; // Oversold - bullish
    else if (rsi > 70) rsiInfluence = -0.02; // Overbought - bearish
    else rsiInfluence = (50 - rsi) / 1000; // Neutral zone

    // MACD influence
    const macdInfluence = macd * 0.001;

    // Volume influence (higher volume = stronger signal)
    const volumeInfluence = Math.log(volume / 1000000) * 0.005;

    // Volatility influence (higher volatility = more uncertainty)
    const volatilityInfluence = volatility * (Math.random() - 0.5) * 2;

    // Market sentiment influence (-1 to 1 scale)
    const sentimentInfluence = marketSentiment * 0.01;

    // Economic indicator influence
    const economicInfluence = economicIndicator * 0.005;

    // Time decay (longer predictions are less certain)
    const timeDecay = Math.pow(0.95, timeHorizon - 1);

    // Combine all influences
    const totalInfluence = (
      rsiInfluence + 
      macdInfluence + 
      volumeInfluence + 
      volatilityInfluence + 
      sentimentInfluence + 
      economicInfluence
    ) * timeDecay;

    // Calculate predicted price
    const predictedPrice = currentPrice * (1 + totalInfluence);
    
    // Calculate confidence based on parameter consistency
    let confidence = 0.7;
    
    // Higher confidence for consistent signals
    if ((rsi < 30 && macd > 0) || (rsi > 70 && macd < 0)) confidence += 0.1;
    if (Math.abs(marketSentiment) > 0.5) confidence += 0.05;
    if (volume > 1500000) confidence += 0.05;
    
    // Lower confidence for high volatility and long time horizons
    confidence -= volatility * 5;
    confidence -= (timeHorizon - 1) * 0.02;
    
    confidence = Math.max(0.3, Math.min(0.95, confidence));

    // Calculate risk level
    const riskScore = volatility * 10 + (timeHorizon / 30) + Math.abs(totalInfluence) * 20;
    let riskLevel: 'Low' | 'Medium' | 'High';
    if (riskScore < 0.5) riskLevel = 'Low';
    else if (riskScore < 1.5) riskLevel = 'Medium';
    else riskLevel = 'High';

    const priceChange = predictedPrice - currentPrice;
    const priceChangePercent = (priceChange / currentPrice) * 100;

    setResult({
      predictedPrice,
      confidence,
      priceChange,
      priceChangePercent,
      riskLevel
    });
    
    setIsCalculating(false);
  };

  const resetParams = () => {
    setParams({
      currentPrice: currentPrice || getUpdated2025Price(symbol),
      rsi: 50,
      macd: 0,
      volume: 1000000,
      volatility: 0.02,
      marketSentiment: 0,
      economicIndicator: 0,
      timeHorizon: 7
    });
    setResult(null);
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-green-400 bg-green-500/20';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'High': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Calculator className="h-6 w-6 text-purple-400" />
          <h3 className="text-xl font-bold">Manual Prediction Parameters</h3>
        </div>
        <button
          onClick={resetParams}
          className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Reset</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Input Parameters */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Current Price */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Current Price ($)
              </label>
              <input
                type="number"
                value={params.currentPrice}
                onChange={(e) => handleParamChange('currentPrice', parseFloat(e.target.value) || 0)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                step="0.01"
                min="0"
              />
            </div>

            {/* RSI */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                RSI (0-100)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={params.rsi}
                onChange={(e) => handleParamChange('rsi', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Oversold</span>
                <span className="font-bold">{params.rsi.toFixed(0)}</span>
                <span>Overbought</span>
              </div>
            </div>

            {/* MACD */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                MACD Signal
              </label>
              <input
                type="range"
                min="-10"
                max="10"
                step="0.1"
                value={params.macd}
                onChange={(e) => handleParamChange('macd', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Bearish</span>
                <span className="font-bold">{params.macd.toFixed(1)}</span>
                <span>Bullish</span>
              </div>
            </div>

            {/* Volume */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Volume (millions)
              </label>
              <input
                type="number"
                value={params.volume / 1000000}
                onChange={(e) => handleParamChange('volume', (parseFloat(e.target.value) || 0) * 1000000)}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
                step="0.1"
                min="0"
              />
            </div>

            {/* Volatility */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Volatility (%)
              </label>
              <input
                type="range"
                min="0"
                max="0.1"
                step="0.001"
                value={params.volatility}
                onChange={(e) => handleParamChange('volatility', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Low</span>
                <span className="font-bold">{(params.volatility * 100).toFixed(1)}%</span>
                <span>High</span>
              </div>
            </div>

            {/* Market Sentiment */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Market Sentiment
              </label>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.1"
                value={params.marketSentiment}
                onChange={(e) => handleParamChange('marketSentiment', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Bearish</span>
                <span className="font-bold">{params.marketSentiment.toFixed(1)}</span>
                <span>Bullish</span>
              </div>
            </div>

            {/* Economic Indicator */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Economic Indicator
              </label>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={params.economicIndicator}
                onChange={(e) => handleParamChange('economicIndicator', parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Negative</span>
                <span className="font-bold">{params.economicIndicator.toFixed(1)}</span>
                <span>Positive</span>
              </div>
            </div>

            {/* Time Horizon */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Time Horizon (days)
              </label>
              <select
                value={params.timeHorizon}
                onChange={(e) => handleParamChange('timeHorizon', parseInt(e.target.value))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>1 Day</option>
                <option value={3}>3 Days</option>
                <option value={7}>1 Week</option>
                <option value={14}>2 Weeks</option>
                <option value={30}>1 Month</option>
                <option value={90}>3 Months</option>
              </select>
            </div>
          </div>

          {/* Calculate Button */}
          <div className="flex justify-center mt-6">
            <button
              onClick={calculatePrediction}
              disabled={isCalculating}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {isCalculating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Calculating...</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span>Generate Prediction</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="h-5 w-5 text-green-400" />
            <h4 className="text-lg font-bold">Prediction Results</h4>
          </div>

          {result ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              {/* Predicted Price */}
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-1">Predicted Price</div>
                <div className="text-2xl font-bold text-purple-400">
                  ${result.predictedPrice.toFixed(2)}
                </div>
                <div className={`text-sm ${
                  result.priceChange >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {result.priceChange >= 0 ? '+' : ''}${result.priceChange.toFixed(2)} 
                  ({result.priceChange >= 0 ? '+' : ''}{result.priceChangePercent.toFixed(2)}%)
                </div>
              </div>

              {/* Confidence Score */}
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-2">AI Confidence</div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-bold text-blue-400">
                    {(result.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-blue-400 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${result.confidence * 100}%` }}
                  />
                </div>
              </div>

              {/* Risk Assessment */}
              <div className={`rounded-lg p-4 border ${getRiskColor(result.riskLevel)}`}>
                <div className="text-sm text-gray-400 mb-1">Risk Level</div>
                <div className="text-lg font-bold">
                  {result.riskLevel}
                </div>
              </div>

              {/* Parameter Impact Analysis */}
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-3">Key Influences</div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span>RSI Impact:</span>
                    <span className={params.rsi < 30 ? 'text-green-400' : params.rsi > 70 ? 'text-red-400' : 'text-gray-400'}>
                      {params.rsi < 30 ? 'Bullish' : params.rsi > 70 ? 'Bearish' : 'Neutral'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>MACD Signal:</span>
                    <span className={params.macd > 0 ? 'text-green-400' : params.macd < 0 ? 'text-red-400' : 'text-gray-400'}>
                      {params.macd > 0 ? 'Bullish' : params.macd < 0 ? 'Bearish' : 'Neutral'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Market Sentiment:</span>
                    <span className={params.marketSentiment > 0 ? 'text-green-400' : params.marketSentiment < 0 ? 'text-red-400' : 'text-gray-400'}>
                      {params.marketSentiment > 0 ? 'Positive' : params.marketSentiment < 0 ? 'Negative' : 'Neutral'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Volatility:</span>
                    <span className={params.volatility > 0.05 ? 'text-red-400' : params.volatility > 0.02 ? 'text-yellow-400' : 'text-green-400'}>
                      {params.volatility > 0.05 ? 'High' : params.volatility > 0.02 ? 'Medium' : 'Low'}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-gray-700 rounded-lg p-8 text-center">
              <Settings className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">
                Adjust the parameters and click "Generate Prediction" to see AI-powered forecasting results.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 text-xs text-gray-500">
        * Manual predictions use advanced algorithms combining technical indicators, market sentiment, and economic factors. Results are for educational purposes only.
      </div>
    </motion.div>
  );
};

const getUpdated2025Price = (symbol: string): number => {
  const prices: { [key: string]: number } = {
    'AAPL': 235,
    'GOOGL': 185,
    'MSFT': 425,
    'TSLA': 185,
    'AMZN': 195,
    'NVDA': 850,
    'META': 580,
    'BTC': 95000,
    'ETH': 3800,
    'SPY': 580
  };
  return prices[symbol] || 100;
};

export default ManualPredictionPanel;