import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { MarketData } from '../types';

interface MarketOverviewProps {
  data: MarketData[];
  onSymbolSelect: (symbol: string) => void;
  selectedSymbol: string;
}

const MarketOverview: React.FC<MarketOverviewProps> = ({ data, onSymbolSelect, selectedSymbol }) => {
  const formatPrice = (price: number) => {
    return price > 1000 ? `$${price.toLocaleString()}` : `$${price.toFixed(2)}`;
  };

  const formatChange = (change: number, percent: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)} (${sign}${percent.toFixed(2)}%)`;
  };

  const getTrendIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4" />;
    if (change < 0) return <TrendingDown className="h-4 w-4" />;
    return <Minus className="h-4 w-4" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const chartData = data.map(item => ({
    symbol: item.symbol,
    price: item.price,
    change: item.changePercent
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-sm text-gray-300">{label}</p>
          <p className="text-sm text-blue-400">
            Price: ${data.price.toFixed(2)}
          </p>
          <p className={`text-sm ${data.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            Change: {data.change.toFixed(2)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Market Overview Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-800 rounded-lg p-6"
      >
        <h3 className="text-xl font-bold mb-4">Market Performance Overview</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="symbol" 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <YAxis 
                stroke="#9CA3AF"
                fontSize={12}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                name="Price"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Market Data Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {data.map((item, index) => (
          <motion.div
            key={item.symbol}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            onClick={() => onSymbolSelect(item.symbol)}
            className={`bg-gray-800 rounded-lg p-4 cursor-pointer transition-all duration-200 hover:bg-gray-750 ${
              selectedSymbol === item.symbol ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">{item.symbol}</h3>
              <div className={`flex items-center space-x-1 ${getTrendColor(item.change)}`}>
                {getTrendIcon(item.change)}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                {formatPrice(item.price)}
              </div>
              
              <div className={`text-sm ${getTrendColor(item.change)}`}>
                {formatChange(item.change, item.changePercent)}
              </div>
              
              <div className="text-xs text-gray-400">
                Vol: {(item.volume / 1000000).toFixed(1)}M
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketOverview;