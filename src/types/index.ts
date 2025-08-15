export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  timestamp: string;
}

export interface TrendData {
  timestamp: string;
  price: number;
  volume: number;
  ma20: number;
  ma50: number;
  rsi: number;
  macd: number;
}

export interface PredictionData {
  timestamp: string;
  predicted: number;
  confidence: number;
  actual?: number;
}

export interface Alert {
  id: string;
  symbol: string;
  type: 'price' | 'volume' | 'trend' | 'volatility';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface AnalysisResult {
  symbol: string;
  trend: 'bullish' | 'bearish' | 'neutral';
  strength: number;
  confidence: number;
  signals: string[];
  nextTarget: number;
  stopLoss: number;
}