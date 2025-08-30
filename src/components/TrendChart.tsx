import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendData } from '../types';
import { dataService } from '../services/dataService';

interface TrendChartProps {
  symbol: string;
}

const TrendChart: React.FC<TrendChartProps> = ({ symbol }) => {
  const [data, setData] = useState<TrendData[]>([]);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [showIndicators, setShowIndicators] = useState({
    ma20: true,
    ma50: true,
    volume: false
  });

  useEffect(() => {
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
    const fetchData = async () => {
      try {
        const historicalData = await dataService.getHistoricalDataAsync(symbol, days);
        setData(historicalData);
      } catch (error) {
        console.error('Error fetching chart data:', error);
        const fallbackData = dataService.generateHistoricalData(symbol, days);
        setData(fallbackData);
      }
    };
    
    fetchData();
  }, [symbol, timeframe]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-sm text-gray-300">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ${entry.value.toFixed(2)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

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
          <LineChart data={data}>
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
    </motion.div>
  );
};

export default TrendChart;