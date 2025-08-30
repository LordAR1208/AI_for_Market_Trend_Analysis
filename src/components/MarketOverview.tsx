import React from 'react';
import { motion } from 'framer-motion';
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

  return (
    <div className="space-y-6">
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
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Helper functions for 2025 market data
const get2025Price = (symbol: string): number => {
  const prices: { [key: string]: number } = {
    'AAPL': 235, 'GOOGL': 185, 'MSFT': 425, 'TSLA': 185, 'AMZN': 195,
    'NVDA': 850, 'META': 580, 'BTC': 95000, 'ETH': 3800, 'SPY': 580,
    'QQQ': 485, 'AMD': 165, 'INTC': 45, 'CRM': 285, 'NFLX': 485
  };
  return prices[symbol] || 100;
};

const get2025Volume = (symbol: string): number => {
  const volumes: { [key: string]: number } = {
    'AAPL': 45000000, 'GOOGL': 25000000, 'MSFT': 35000000, 'TSLA': 85000000,
    'AMZN': 30000000, 'NVDA': 55000000, 'META': 20000000, 'BTC': 15000000,
    'ETH': 8000000, 'SPY': 75000000, 'QQQ': 45000000, 'AMD': 40000000
  };
  return volumes[symbol] || 1000000;
};

const get2025MarketCap = (symbol: string): number => {
  const marketCaps: { [key: string]: number } = {
    'AAPL': 3600000000000, 'GOOGL': 2200000000000, 'MSFT': 3200000000000,
    'TSLA': 580000000000, 'AMZN': 1800000000000, 'NVDA': 2100000000000,
    'META': 1500000000000, 'BTC': 1900000000000, 'ETH': 450000000000
  };
  return marketCaps[symbol] || 100000000000;
};

export default MarketOverview;