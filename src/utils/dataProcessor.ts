/**
 * Data Processing Utilities
 * Handles data transformation, validation, and normalization
 */

import { TechnicalIndicators } from './technicalIndicators';
import { ExternalMarketData } from './apiClient';

export interface ProcessedMarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  timestamp: string;
  technicalIndicators?: {
    rsi?: number;
    macd?: number;
    sma20?: number;
    sma50?: number;
    trend?: 'bullish' | 'bearish' | 'neutral';
  };
}

export interface DataQualityMetrics {
  completeness: number;
  accuracy: number;
  timeliness: number;
  consistency: number;
  overall: number;
}

export class DataProcessor {
  /**
   * Validate and clean market data
   */
  static validateMarketData(data: ExternalMarketData[]): ExternalMarketData[] {
    return data.filter(item => {
      // Basic validation rules
      if (!item.symbol || typeof item.symbol !== 'string') return false;
      if (!item.price || typeof item.price !== 'number' || item.price <= 0) return false;
      if (typeof item.volume !== 'number' || item.volume < 0) return false;
      if (!item.timestamp) return false;
      
      // Check for reasonable price ranges
      if (item.price > 1000000) return false; // Unreasonably high price
      if (item.changePercent && Math.abs(item.changePercent) > 50) return false; // Unreasonable change
      
      return true;
    });
  }

  /**
   * Normalize data from different sources
   */
  static normalizeMarketData(data: ExternalMarketData[]): ProcessedMarketData[] {
    return data.map(item => ({
      symbol: item.symbol.toUpperCase(),
      price: this.roundToSignificantDigits(item.price, 6),
      change: this.roundToSignificantDigits(item.change, 4),
      changePercent: this.roundToSignificantDigits(item.changePercent, 2),
      volume: Math.round(item.volume),
      marketCap: item.marketCap ? Math.round(item.marketCap) : undefined,
      timestamp: new Date(item.timestamp).toISOString()
    }));
  }

  /**
   * Calculate data quality metrics
   */
  static calculateDataQuality(data: ExternalMarketData[]): DataQualityMetrics {
    if (data.length === 0) {
      return { completeness: 0, accuracy: 0, timeliness: 0, consistency: 0, overall: 0 };
    }

    // Completeness: percentage of non-null required fields
    const requiredFields = ['symbol', 'price', 'volume', 'timestamp'];
    let completeRecords = 0;
    
    data.forEach(item => {
      const hasAllFields = requiredFields.every(field => 
        item[field as keyof ExternalMarketData] !== null && 
        item[field as keyof ExternalMarketData] !== undefined
      );
      if (hasAllFields) completeRecords++;
    });
    
    const completeness = completeRecords / data.length;

    // Timeliness: how recent the data is
    const now = Date.now();
    const avgAge = data.reduce((sum, item) => {
      const age = now - new Date(item.timestamp).getTime();
      return sum + age;
    }, 0) / data.length;
    
    const timeliness = Math.max(0, 1 - (avgAge / (5 * 60 * 1000))); // 5 minutes threshold

    // Accuracy: check for outliers and unreasonable values
    let accurateRecords = 0;
    data.forEach(item => {
      const isReasonable = 
        item.price > 0 && item.price < 1000000 &&
        Math.abs(item.changePercent) < 50 &&
        item.volume >= 0;
      if (isReasonable) accurateRecords++;
    });
    
    const accuracy = accurateRecords / data.length;

    // Consistency: check for data consistency across time
    const consistency = this.calculateConsistency(data);

    // Overall quality score
    const overall = (completeness + accuracy + timeliness + consistency) / 4;

    return {
      completeness: Math.round(completeness * 100) / 100,
      accuracy: Math.round(accuracy * 100) / 100,
      timeliness: Math.round(timeliness * 100) / 100,
      consistency: Math.round(consistency * 100) / 100,
      overall: Math.round(overall * 100) / 100
    };
  }

  /**
   * Detect anomalies in market data
   */
  static detectAnomalies(prices: number[], threshold: number = 3): number[] {
    if (prices.length < 10) return [];

    const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
    const stdDev = Math.sqrt(variance);

    const anomalies: number[] = [];
    
    prices.forEach((price, index) => {
      const zScore = Math.abs(price - mean) / stdDev;
      if (zScore > threshold) {
        anomalies.push(index);
      }
    });

    return anomalies;
  }

  /**
   * Smooth data using moving average
   */
  static smoothData(data: number[], windowSize: number = 5): number[] {
    if (data.length < windowSize) return data;

    const smoothed: number[] = [];
    
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - Math.floor(windowSize / 2));
      const end = Math.min(data.length, i + Math.ceil(windowSize / 2));
      const window = data.slice(start, end);
      const average = window.reduce((sum, val) => sum + val, 0) / window.length;
      smoothed.push(average);
    }

    return smoothed;
  }

  /**
   * Calculate correlation between two data series
   */
  static calculateCorrelation(series1: number[], series2: number[]): number {
    if (series1.length !== series2.length || series1.length === 0) {
      return 0;
    }

    const n = series1.length;
    const mean1 = series1.reduce((sum, val) => sum + val, 0) / n;
    const mean2 = series2.reduce((sum, val) => sum + val, 0) / n;

    let numerator = 0;
    let sumSq1 = 0;
    let sumSq2 = 0;

    for (let i = 0; i < n; i++) {
      const diff1 = series1[i] - mean1;
      const diff2 = series2[i] - mean2;
      
      numerator += diff1 * diff2;
      sumSq1 += diff1 * diff1;
      sumSq2 += diff2 * diff2;
    }

    const denominator = Math.sqrt(sumSq1 * sumSq2);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Generate synthetic data for testing
   */
  static generateSyntheticData(
    symbol: string, 
    days: number, 
    basePrice: number = 100,
    volatility: number = 0.02
  ): ProcessedMarketData[] {
    const data: ProcessedMarketData[] = [];
    let currentPrice = basePrice;

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (days - i));

      // Generate realistic price movement
      const randomChange = (Math.random() - 0.5) * volatility * 2;
      const trendFactor = Math.sin(i / 10) * 0.001; // Add some trend
      currentPrice = currentPrice * (1 + randomChange + trendFactor);

      const volume = Math.floor(Math.random() * 1000000) + 100000;
      const change = i > 0 ? currentPrice - data[i - 1].price : 0;
      const changePercent = i > 0 ? (change / data[i - 1].price) * 100 : 0;

      data.push({
        symbol,
        price: this.roundToSignificantDigits(currentPrice, 6),
        change: this.roundToSignificantDigits(change, 4),
        changePercent: this.roundToSignificantDigits(changePercent, 2),
        volume,
        timestamp: date.toISOString()
      });
    }

    return data;
  }

  /**
   * Calculate volatility metrics
   */
  static calculateVolatility(prices: number[], period: number = 20): {
    historical: number;
    annualized: number;
    percentile: number;
  } {
    if (prices.length < period) {
      return { historical: 0, annualized: 0, percentile: 0 };
    }

    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push(Math.log(prices[i] / prices[i - 1]));
    }

    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
    const historical = Math.sqrt(variance);
    const annualized = historical * Math.sqrt(252); // 252 trading days per year

    // Calculate percentile ranking
    const sortedReturns = [...returns].sort((a, b) => Math.abs(b) - Math.abs(a));
    const currentVolatility = Math.abs(returns[returns.length - 1]);
    const rank = sortedReturns.findIndex(ret => Math.abs(ret) <= currentVolatility);
    const percentile = (rank / sortedReturns.length) * 100;

    return {
      historical: this.roundToSignificantDigits(historical, 4),
      annualized: this.roundToSignificantDigits(annualized, 4),
      percentile: Math.round(percentile)
    };
  }

  private static calculateConsistency(data: ExternalMarketData[]): number {
    if (data.length < 2) return 1;

    // Check for consistent data patterns
    let consistentRecords = 0;
    
    for (let i = 1; i < data.length; i++) {
      const current = data[i];
      const previous = data[i - 1];
      
      // Check if price changes are consistent with reported changes
      const actualChange = current.price - previous.price;
      const reportedChange = current.change;
      
      const changeConsistency = Math.abs(actualChange - reportedChange) < (previous.price * 0.001);
      
      if (changeConsistency) {
        consistentRecords++;
      }
    }

    return consistentRecords / (data.length - 1);
  }

  private static roundToSignificantDigits(num: number, digits: number): number {
    if (num === 0) return 0;
    const magnitude = Math.floor(Math.log10(Math.abs(num)));
    const factor = Math.pow(10, digits - magnitude - 1);
    return Math.round(num * factor) / factor;
  }
}

export const dataProcessor = new DataProcessor();</parameter>