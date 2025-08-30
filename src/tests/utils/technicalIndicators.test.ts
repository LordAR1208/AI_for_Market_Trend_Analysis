import { describe, it, expect } from 'vitest';
import { TechnicalIndicators } from '../../utils/technicalIndicators';

describe('TechnicalIndicators', () => {
  const samplePrices = [
    44.34, 44.09, 44.15, 43.61, 44.33, 44.83, 45.85, 46.08, 45.89, 46.03,
    46.83, 46.69, 46.45, 46.59, 46.3, 46.28, 46.28, 46.00, 46.03, 46.41,
    46.22, 45.64, 46.21, 46.25, 45.71, 46.45, 47.20, 47.72, 47.90, 47.87
  ];

  describe('calculateRSI', () => {
    it('should calculate RSI correctly', () => {
      const rsi = TechnicalIndicators.calculateRSI(samplePrices, 14);
      
      expect(rsi).toHaveLength(samplePrices.length - 14);
      expect(rsi[rsi.length - 1]).toBeGreaterThan(0);
      expect(rsi[rsi.length - 1]).toBeLessThan(100);
    });

    it('should return empty array for insufficient data', () => {
      const rsi = TechnicalIndicators.calculateRSI([1, 2, 3], 14);
      expect(rsi).toEqual([]);
    });
  });

  describe('calculateSMA', () => {
    it('should calculate simple moving average correctly', () => {
      const sma = TechnicalIndicators.calculateSMA(samplePrices, 5);
      
      expect(sma).toHaveLength(samplePrices.length - 4);
      
      // First SMA should be average of first 5 prices
      const expectedFirst = samplePrices.slice(0, 5).reduce((a, b) => a + b, 0) / 5;
      expect(sma[0]).toBeCloseTo(expectedFirst, 2);
    });

    it('should return empty array for insufficient data', () => {
      const sma = TechnicalIndicators.calculateSMA([1, 2], 5);
      expect(sma).toEqual([]);
    });
  });

  describe('calculateEMA', () => {
    it('should calculate exponential moving average correctly', () => {
      const ema = TechnicalIndicators.calculateEMA(samplePrices, 12);
      
      expect(ema).toHaveLength(samplePrices.length - 11);
      expect(ema[ema.length - 1]).toBeGreaterThan(0);
    });
  });

  describe('calculateMACD', () => {
    it('should calculate MACD correctly', () => {
      const { macd, signal, histogram } = TechnicalIndicators.calculateMACD(samplePrices);
      
      expect(macd.length).toBeGreaterThan(0);
      expect(signal.length).toBeGreaterThan(0);
      expect(histogram.length).toBeGreaterThan(0);
      expect(histogram.length).toBe(signal.length);
    });
  });

  describe('calculateBollingerBands', () => {
    it('should calculate Bollinger Bands correctly', () => {
      const { upper, middle, lower } = TechnicalIndicators.calculateBollingerBands(samplePrices, 20);
      
      expect(upper.length).toBe(middle.length);
      expect(middle.length).toBe(lower.length);
      
      // Upper band should be above middle, middle above lower
      for (let i = 0; i < upper.length; i++) {
        expect(upper[i]).toBeGreaterThan(middle[i]);
        expect(middle[i]).toBeGreaterThan(lower[i]);
      }
    });
  });

  describe('detectPatterns', () => {
    it('should detect basic patterns', () => {
      const patterns = TechnicalIndicators.detectPatterns(samplePrices);
      
      expect(Array.isArray(patterns)).toBe(true);
      expect(patterns.length).toBeGreaterThan(0);
    });

    it('should return empty array for insufficient data', () => {
      const patterns = TechnicalIndicators.detectPatterns([1, 2, 3]);
      expect(patterns).toEqual([]);
    });
  });
});</parameter>