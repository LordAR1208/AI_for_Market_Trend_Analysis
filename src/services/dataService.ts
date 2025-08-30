import { MarketData, TrendData, PredictionData, Alert, AnalysisResult } from '../types';
import { marketDataService } from './marketDataService';
import { alertService } from './alertService';
import { analysisService } from './analysisService';
import { authService } from './authService';
import { predictionService } from './predictionService';

class DataService {
  private wsConnection: WebSocket | null = null;
  private dataUpdateInterval: NodeJS.Timeout | null = null;
  private isUsingRealData: boolean = true;

  // Mock API endpoints - in production, these would be real market data APIs
  private readonly API_BASE = 'https://api.marketdata.com/v1';
  
  // Simulate real-time market data
  generateMockMarketData(): MarketData[] {
    // Try to use real data first
    if (this.isUsingRealData) {
      return this.getLatestMarketData();
    }
    
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

  async getLatestMarketData(): Promise<MarketData[]> {
    try {
      return await marketDataService.getLatestMarketData();
    } catch (error) {
      console.error('Error fetching real market data, falling back to mock:', error);
      return this.generateMockMarketData();
    }
  }

  generateHistoricalData(symbol: string, days: number = 30): TrendData[] {
    // Try to use real data first
    if (this.isUsingRealData) {
      return this.getHistoricalData(symbol, days);
    }
    
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

  async getHistoricalData(symbol: string, days: number = 30): Promise<TrendData[]> {
    try {
      return await marketDataService.getHistoricalData(symbol, days);
    } catch (error) {
      console.error('Error fetching real historical data, falling back to mock:', error);
      return this.generateHistoricalData(symbol, days);
    }
  }

  generatePredictions(symbol: string): PredictionData[] {
    // Try to use real data first
    if (this.isUsingRealData) {
      return this.getPredictions(symbol);
    }
    
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

  async getPredictions(symbol: string): Promise<PredictionData[]> {
    try {
      return await marketDataService.getPredictions(symbol);
    } catch (error) {
      console.error('Error fetching real predictions, falling back to mock:', error);
      return this.generatePredictions(symbol);
    }
  }

  // Public method for predictions
  async getPredictionsAsync(symbol: string): Promise<PredictionData[]> {
    try {
      const enhancedPredictions = await predictionService.generateEnhancedPredictions(symbol, 7);
      return enhancedPredictions.map(pred => ({
        timestamp: pred.timestamp,
        predicted: pred.predicted,
        confidence: pred.confidence,
        actual: pred.actual
      }));
    } catch (error) {
      console.error('Error getting enhanced predictions:', error);
      return this.getPredictions(symbol);
    }
  }

  // Public method for historical data
  async getHistoricalDataAsync(symbol: string, days: number = 30): Promise<TrendData[]> {
    return this.getHistoricalData(symbol, days);
  }

  // Public method for user alerts
  async getUserAlertsPublic(): Promise<Alert[]> {
    return this.getUserAlerts();
  }

  // Public method for real analysis
  async getRealAnalysisPublic(symbol: string): Promise<AnalysisResult> {
    return this.getRealAnalysis(symbol);
  }

  // Public method for technical analysis
  performTechnicalAnalysisPublic(symbol: string): AnalysisResult {
    return this.performTechnicalAnalysis(symbol);
  }

  generateAlerts(): Alert[] {
    // For authenticated users, get real alerts
    if (this.isUsingRealData && authService.isAuthenticated()) {
      return this.getUserAlerts();
    }
    
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

  async getUserAlerts(): Promise<Alert[]> {
    try {
      const user = authService.getUser();
      if (!user) return [];
      
      return await alertService.getAlertsForFrontend(user.id);
    } catch (error) {
      console.error('Error fetching user alerts, falling back to mock:', error);
      return this.generateAlerts();
    }
  }

  performTechnicalAnalysis(symbol: string): AnalysisResult {
    // Try to use real analysis first
    if (this.isUsingRealData) {
      return this.getRealAnalysis(symbol);
    }
    
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

  async getRealAnalysis(symbol: string): Promise<AnalysisResult> {
    try {
      return await analysisService.performTechnicalAnalysis(symbol);
    } catch (error) {
      console.error('Error fetching real analysis, falling back to mock:', error);
      return this.performTechnicalAnalysis(symbol);
    }
  }

  private getBasePrice(symbol: string): number {
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
  }

  private getSymbolVolatility(symbol: string): number {
    const volatilities: { [key: string]: number } = {
      'AAPL': 0.025,
      'GOOGL': 0.03,
      'MSFT': 0.02,
      'TSLA': 0.08,  // Higher volatility for Tesla
      'AMZN': 0.035,
      'NVDA': 0.06,  // Higher volatility for NVIDIA
      'META': 0.04,
      'BTC': 0.15,   // Very high volatility for crypto
      'ETH': 0.12,
      'SPY': 0.015   // Lower volatility for index
    };
    return volatilities[symbol] || 0.03;
  }

  private getRealisticVolume(symbol: string): number {
    const baseVolumes: { [key: string]: number } = {
      'AAPL': 45000000,
      'GOOGL': 25000000,
      'MSFT': 35000000,
      'TSLA': 85000000,
      'AMZN': 30000000,
      'NVDA': 55000000,
      'META': 20000000,
      'BTC': 15000000,
      'ETH': 8000000,
      'SPY': 75000000
    };
    const baseVolume = baseVolumes[symbol] || 1000000;
    return Math.floor(baseVolume * (0.7 + Math.random() * 0.6));
  }

  private getMarketCap(symbol: string): number {
    const marketCaps: { [key: string]: number } = {
      'AAPL': 3600000000000,    // $3.6T
      'GOOGL': 2200000000000,   // $2.2T
      'MSFT': 3200000000000,    // $3.2T
      'TSLA': 580000000000,     // $580B
      'AMZN': 1800000000000,    // $1.8T
      'NVDA': 2100000000000,    // $2.1T
      'META': 1500000000000,    // $1.5T
      'BTC': 1900000000000,     // $1.9T
      'ETH': 450000000000,      // $450B
      'SPY': 0                  // ETF doesn't have market cap
    };
    return marketCaps[symbol] || 100000000000;
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
    // Try to use real-time subscription first
    if (this.isUsingRealData) {
      marketDataService.subscribeToRealTimeUpdates(callback);
      return;
    }
    
    if (this.dataUpdateInterval) {
      clearInterval(this.dataUpdateInterval);
    }

    this.dataUpdateInterval = setInterval(() => {
      const newData = this.generateMockMarketData();
      callback(newData);
    }, 2000);
  }

  stopRealTimeUpdates(): void {
    // Stop real-time subscription
    marketDataService.unsubscribeFromRealTimeUpdates();
    
    if (this.dataUpdateInterval) {
      clearInterval(this.dataUpdateInterval);
      this.dataUpdateInterval = null;
    }
  }
}

export const dataService = new DataService();