import { MarketData, TrendData, PredictionData, Alert, AnalysisResult } from '../types';

class DataService {
  private wsConnection: WebSocket | null = null;
  private dataUpdateInterval: NodeJS.Timeout | null = null;

  // Mock API endpoints - in production, these would be real market data APIs
  private readonly API_BASE = 'https://api.marketdata.com/v1';
  
  // Simulate real-time market data
  generateMockMarketData(): MarketData[] {
    const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA', 'META', 'BTC', 'ETH', 'SPY'];
    
    return symbols.map(symbol => {
      const basePrice = this.getBasePrice(symbol);
      const change = (Math.random() - 0.5) * basePrice * 0.05;
      const changePercent = (change / basePrice) * 100;
      
      return {
        symbol,
        price: basePrice + change,
        change,
        changePercent,
        volume: Math.floor(Math.random() * 1000000) + 100000,
        marketCap: basePrice * 1000000000,
        timestamp: new Date().toISOString()
      };
    });
  }

  generateHistoricalData(symbol: string, days: number = 30): TrendData[] {
    const data: TrendData[] = [];
    const basePrice = this.getBasePrice(symbol);
    let currentPrice = basePrice;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Simulate price movement with some trend
      const randomChange = (Math.random() - 0.5) * 0.02;
      currentPrice = currentPrice * (1 + randomChange);
      
      const volume = Math.floor(Math.random() * 1000000) + 100000;
      const ma20 = currentPrice * (0.98 + Math.random() * 0.04);
      const ma50 = currentPrice * (0.95 + Math.random() * 0.1);
      const rsi = Math.random() * 100;
      const macd = (Math.random() - 0.5) * 10;
      
      data.push({
        timestamp: date.toISOString().split('T')[0],
        price: currentPrice,
        volume,
        ma20,
        ma50,
        rsi,
        macd
      });
    }
    
    return data;
  }

  generatePredictions(symbol: string): PredictionData[] {
    const predictions: PredictionData[] = [];
    const basePrice = this.getBasePrice(symbol);
    let currentPrice = basePrice;
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      // Simulate AI prediction with decreasing confidence over time
      const trendFactor = Math.random() > 0.5 ? 1.005 : 0.995;
      currentPrice = currentPrice * trendFactor;
      const confidence = Math.max(0.6, 0.95 - (i * 0.05));
      
      predictions.push({
        timestamp: date.toISOString().split('T')[0],
        predicted: currentPrice,
        confidence
      });
    }
    
    return predictions;
  }

  generateAlerts(): Alert[] {
    const alerts: Alert[] = [];
    const symbols = ['AAPL', 'GOOGL', 'TSLA', 'BTC'];
    const alertTypes = ['price', 'volume', 'trend', 'volatility'] as const;
    const severities = ['low', 'medium', 'high'] as const;
    
    for (let i = 0; i < 5; i++) {
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const type = alertTypes[Math.floor(Math.random() * alertTypes.length)];
      const severity = severities[Math.floor(Math.random() * severities.length)];
      
      alerts.push({
        id: `alert-${i}`,
        symbol,
        type,
        severity,
        message: this.generateAlertMessage(symbol, type, severity),
        timestamp: new Date().toISOString(),
        isRead: Math.random() > 0.7
      });
    }
    
    return alerts;
  }

  performTechnicalAnalysis(symbol: string): AnalysisResult {
    const signals = [];
    const trend = Math.random() > 0.6 ? 'bullish' : Math.random() > 0.3 ? 'bearish' : 'neutral';
    const strength = Math.random() * 100;
    const confidence = 0.7 + Math.random() * 0.3;
    
    // Generate realistic trading signals
    if (trend === 'bullish') {
      signals.push('Golden Cross detected', 'RSI oversold bounce', 'Volume breakout');
    } else if (trend === 'bearish') {
      signals.push('Death Cross forming', 'RSI overbought', 'Support level broken');
    } else {
      signals.push('Sideways consolidation', 'Low volatility');
    }
    
    const basePrice = this.getBasePrice(symbol);
    const nextTarget = trend === 'bullish' ? basePrice * 1.1 : basePrice * 0.9;
    const stopLoss = trend === 'bullish' ? basePrice * 0.95 : basePrice * 1.05;
    
    return {
      symbol,
      trend,
      strength,
      confidence,
      signals,
      nextTarget,
      stopLoss
    };
  }

  private getBasePrice(symbol: string): number {
    const prices: { [key: string]: number } = {
      'AAPL': 175,
      'GOOGL': 135,
      'MSFT': 350,
      'TSLA': 220,
      'AMZN': 145,
      'NVDA': 450,
      'META': 310,
      'BTC': 43000,
      'ETH': 2500,
      'SPY': 450
    };
    return prices[symbol] || 100;
  }

  private generateAlertMessage(symbol: string, type: string, severity: string): string {
    const messages = {
      price: `${symbol} price moved ${severity === 'high' ? 'significantly' : 'notably'}`,
      volume: `${symbol} showing unusual volume activity`,
      trend: `${symbol} trend change detected`,
      volatility: `${symbol} volatility spike detected`
    };
    return messages[type as keyof typeof messages];
  }

  // Simulate WebSocket connection for real-time updates
  startRealTimeUpdates(callback: (data: MarketData[]) => void): void {
    if (this.dataUpdateInterval) {
      clearInterval(this.dataUpdateInterval);
    }

    this.dataUpdateInterval = setInterval(() => {
      const newData = this.generateMockMarketData();
      callback(newData);
    }, 2000);
  }

  stopRealTimeUpdates(): void {
    if (this.dataUpdateInterval) {
      clearInterval(this.dataUpdateInterval);
      this.dataUpdateInterval = null;
    }
  }
}

export const dataService = new DataService();