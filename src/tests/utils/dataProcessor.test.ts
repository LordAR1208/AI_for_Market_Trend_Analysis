import { describe, it, expect } from 'vitest';
import { DataProcessor } from '../../utils/dataProcessor';
import { ExternalMarketData } from '../../utils/apiClient';

describe('DataProcessor', () => {
  const sampleData: ExternalMarketData[] = [
    {
      symbol: 'AAPL',
      price: 150.25,
      change: 2.50,
      changePercent: 1.69,
      volume: 1000000,
      timestamp: '2024-01-01T10:00:00Z'
    },
    {
      symbol: 'GOOGL',
      price: 2800.75,
      change: -15.25,
      changePercent: -0.54,
      volume: 500000,
      timestamp: '2024-01-01T10:00:00Z'
    }
  ];

  describe('validateMarketData', () => {
    it('should validate correct market data', () => {
      const validated = DataProcessor.validateMarketData(sampleData);
      expect(validated).toHaveLength(2);
    });

    it('should filter out invalid data', () => {
      const invalidData: ExternalMarketData[] = [
        ...sampleData,
        {
          symbol: '',
          price: -100,
          change: 0,
          changePercent: 0,
          volume: -1000,
          timestamp: ''
        }
      ];

      const validated = DataProcessor.validateMarketData(invalidData);
      expect(validated).toHaveLength(2);
    });

    it('should filter out unreasonable price changes', () => {
      const unreasonableData: ExternalMarketData[] = [
        ...sampleData,
        {
          symbol: 'TEST',
          price: 100,
          change: 60,
          changePercent: 60,
          volume: 1000,
          timestamp: '2024-01-01T10:00:00Z'
        }
      ];

      const validated = DataProcessor.validateMarketData(unreasonableData);
      expect(validated).toHaveLength(2);
    });
  });

  describe('normalizeMarketData', () => {
    it('should normalize market data correctly', () => {
      const normalized = DataProcessor.normalizeMarketData(sampleData);
      
      expect(normalized[0].symbol).toBe('AAPL');
      expect(normalized[0].price).toBe(150.25);
      expect(typeof normalized[0].volume).toBe('number');
      expect(new Date(normalized[0].timestamp)).toBeInstanceOf(Date);
    });

    it('should convert symbols to uppercase', () => {
      const lowercaseData = [{
        ...sampleData[0],
        symbol: 'aapl'
      }];

      const normalized = DataProcessor.normalizeMarketData(lowercaseData);
      expect(normalized[0].symbol).toBe('AAPL');
    });
  });

  describe('calculateDataQuality', () => {
    it('should calculate quality metrics for good data', () => {
      const quality = DataProcessor.calculateDataQuality(sampleData);
      
      expect(quality.completeness).toBeGreaterThan(0.8);
      expect(quality.accuracy).toBeGreaterThan(0.8);
      expect(quality.overall).toBeGreaterThan(0.5);
    });

    it('should return zero quality for empty data', () => {
      const quality = DataProcessor.calculateDataQuality([]);
      
      expect(quality.completeness).toBe(0);
      expect(quality.accuracy).toBe(0);
      expect(quality.timeliness).toBe(0);
      expect(quality.consistency).toBe(0);
      expect(quality.overall).toBe(0);
    });
  });

  describe('detectAnomalies', () => {
    it('should detect price anomalies', () => {
      const prices = [100, 101, 99, 102, 98, 500, 103, 97]; // 500 is an anomaly
      const anomalies = DataProcessor.detectAnomalies(prices, 2);
      
      expect(anomalies).toContain(5); // Index of the anomalous value
    });

    it('should return empty array for insufficient data', () => {
      const anomalies = DataProcessor.detectAnomalies([1, 2, 3], 2);
      expect(anomalies).toEqual([]);
    });
  });

  describe('smoothData', () => {
    it('should smooth data using moving average', () => {
      const data = [1, 5, 2, 8, 3, 7, 4, 6];
      const smoothed = DataProcessor.smoothData(data, 3);
      
      expect(smoothed).toHaveLength(data.length);
      expect(smoothed[0]).toBe(data[0]); // First value should be unchanged
    });
  });

  describe('calculateCorrelation', () => {
    it('should calculate correlation between two series', () => {
      const series1 = [1, 2, 3, 4, 5];
      const series2 = [2, 4, 6, 8, 10]; // Perfect positive correlation
      
      const correlation = DataProcessor.calculateCorrelation(series1, series2);
      expect(correlation).toBeCloseTo(1, 2);
    });

    it('should return 0 for uncorrelated series', () => {
      const series1 = [1, 2, 3, 4, 5];
      const series2 = [5, 4, 3, 2, 1]; // Perfect negative correlation
      
      const correlation = DataProcessor.calculateCorrelation(series1, series2);
      expect(correlation).toBeCloseTo(-1, 2);
    });

    it('should handle empty or mismatched series', () => {
      const correlation1 = DataProcessor.calculateCorrelation([], []);
      const correlation2 = DataProcessor.calculateCorrelation([1, 2], [1, 2, 3]);
      
      expect(correlation1).toBe(0);
      expect(correlation2).toBe(0);
    });
  });

  describe('generateSyntheticData', () => {
    it('should generate synthetic market data', () => {
      const data = DataProcessor.generateSyntheticData('TEST', 30, 100, 0.02);
      
      expect(data).toHaveLength(30);
      expect(data[0].symbol).toBe('TEST');
      expect(data[0].price).toBeCloseTo(100, 0);
      
      // Check that all required fields are present
      data.forEach(item => {
        expect(item.symbol).toBe('TEST');
        expect(typeof item.price).toBe('number');
        expect(typeof item.volume).toBe('number');
        expect(typeof item.timestamp).toBe('string');
      });
    });
  });

  describe('calculateVolatility', () => {
    it('should calculate volatility metrics', () => {
      const prices = Array.from({ length: 30 }, (_, i) => 100 + Math.sin(i) * 5);
      const volatility = DataProcessor.calculateVolatility(prices, 20);
      
      expect(volatility.historical).toBeGreaterThan(0);
      expect(volatility.annualized).toBeGreaterThan(0);
      expect(volatility.percentile).toBeGreaterThanOrEqual(0);
      expect(volatility.percentile).toBeLessThanOrEqual(100);
    });

    it('should handle insufficient data', () => {
      const volatility = DataProcessor.calculateVolatility([100, 101], 20);
      
      expect(volatility.historical).toBe(0);
      expect(volatility.annualized).toBe(0);
      expect(volatility.percentile).toBe(0);
    });
  });
});</parameter>