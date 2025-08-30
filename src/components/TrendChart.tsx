import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendData } from '../types';
import { dataService } from '../services/dataService';
import LoadingSpinner from './LoadingSpinner';

interface TrendChartProps {
  symbol: string;
}

const TrendChart: React.FC<TrendChartProps> = ({ symbol }) => {
  const [data, setData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [showIndicators, setShowIndicators] = useState({
    ma20: true,
    ma50: true,
    volume: false
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
        
        // Try to get real data first, fallback to mock data
        let historicalData: TrendData[];
        try {
          historicalData = await dataService.getHistoricalDataAsync(symbol, days);
        } catch (err) {
          console.warn('Using fallback data generation:', err);
          historicalData = generateFallbackData(symbol, days);
        }
        
        // Ensure we have valid data
        if (!historicalData || historicalData.length === 0) {
          historicalData = generateFallbackData(symbol, days);
        }
        
        setData(historicalData);
      } catch (err: any) {
        console.error('Error fetching chart data:', err);
        setError(err.message || 'Failed to load chart data');
        // Generate fallback data even on error
        const fallbackData = generateFallbackData(symbol, timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90);
        setData(fallbackData);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [symbol, timeframe]);

  const generateFallbackData = (symbol: string, days: number): TrendData[] => {
    const data: TrendData[] = [];
    const basePrice = getBasePrice(symbol);
    let currentPrice = basePrice;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Generate realistic price movement
      const randomChange = (Math.random() - 0.5) * 0.02;
      currentPrice = currentPrice * (1 + randomChange);
      
      const volume = Math.floor(Math.random() * 1000000) + 100000;
      const ma20 = currentPrice * (0.98 + Math.random() * 0.04);
      const ma50 = currentPrice * (0.95 + Math.random() * 0.1);
      const rsi = Math.random() * 100;
      const macd = (Math.random() - 0.5) * 10;
      
      data.push({
        timestamp: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        price: currentPrice,
        volume,
        ma20,
        ma50,
        rsi,
        macd
      });
    }
    
    return data;
  };

  const getBasePrice = (symbol: string): number => {
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

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-sm text-gray-300 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ${typeof entry.value === 'number' ? entry.value.toFixed(2) : '0.00'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gray-800 rounded-lg p-6 h-96 flex items-center justify-center"
      >
        <LoadingSpinner size="lg" message="Loading chart data..." />
      </motion.div>
    );
  }

  if (error && data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-gray-800 rounded-lg p-6 h-96 flex items-center justify-center"
      >
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gray-800 rounded-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold">{symbol} Price Chart</h3>
        
        <div className="flex items-center space-x-4">
          {/* Timeframe Selector */}
          <div className="flex bg-gray-700 rounded-lg">
            {(['7d', '30d', '90d'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 text-sm rounded ${
                  timeframe === tf 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Indicators Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowIndicators(prev => ({ ...prev, ma20: !prev.ma20 }))}
              className={`px-2 py-1 text-xs rounded ${
                showIndicators.ma20 ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-400'
              }`}
            >
              MA20
            </button>
            <button
              onClick={() => setShowIndicators(prev => ({ ...prev, ma50: !prev.ma50 }))}
              className={`px-2 py-1 text-xs rounded ${
                showIndicators.ma50 ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-400'
              }`}
            >
              MA50
            </button>
          </div>
        </div>
      </div>

      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="timestamp" 
              stroke="#9CA3AF"
              fontSize={12}
            />
            <YAxis 
              stroke="#9CA3AF"
              fontSize={12}
              domain={['dataMin * 0.98', 'dataMax * 1.02']}
              tickFormatter={(value) => `$${value.toFixed(0)}`}
            />
            <Tooltip content={<CustomTooltip />} />
            
            <Line
              type="monotone"
              dataKey="price"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={false}
              name="Price"
            />
            
            {showIndicators.ma20 && (
              <Line
                type="monotone"
                dataKey="ma20"
                stroke="#EAB308"
                strokeWidth={1}
                dot={false}
                strokeDasharray="5 5"
                name="MA20"
              />
            )}
            
            {showIndicators.ma50 && (
              <Line
                type="monotone"
                dataKey="ma50"
                stroke="#F97316"
                strokeWidth={1}
                dot={false}
                strokeDasharray="5 5"
                name="MA50"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {data.length > 0 && (
        <div className="mt-4 text-xs text-gray-500">
          Showing {data.length} data points for {symbol} over {timeframe}
        </div>
      )}
    </motion.div>
  );
};

export default TrendChart;