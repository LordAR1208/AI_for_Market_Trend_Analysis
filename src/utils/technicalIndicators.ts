/**
 * Technical Indicators Calculation Utilities
 * Production-ready implementations of common technical analysis indicators
 */

export interface TechnicalIndicatorResult {
  rsi: number[];
  macd: { macd: number[]; signal: number[]; histogram: number[] };
  sma: { [period: number]: number[] };
  ema: { [period: number]: number[] };
  bollingerBands: { upper: number[]; middle: number[]; lower: number[] };
  stochastic: { k: number[]; d: number[] };
  atr: number[];
  adx: number[];
}

export class TechnicalIndicators {
  /**
   * Calculate Relative Strength Index (RSI)
   */
  static calculateRSI(prices: number[], period: number = 14): number[] {
    if (prices.length < period + 1) return [];
    
    const rsi: number[] = [];
    const gains: number[] = [];
    const losses: number[] = [];
    
    // Calculate initial gains and losses
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      gains.push(change > 0 ? change : 0);
      losses.push(change < 0 ? Math.abs(change) : 0);
    }
    
    // Calculate RSI
    for (let i = period - 1; i < gains.length; i++) {
      const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
      
      if (avgLoss === 0) {
        rsi.push(100);
      } else {
        const rs = avgGain / avgLoss;
        rsi.push(100 - (100 / (1 + rs)));
      }
    }
    
    return rsi;
  }

  /**
   * Calculate Moving Average Convergence Divergence (MACD)
   */
  static calculateMACD(prices: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9) {
    const emaFast = this.calculateEMA(prices, fastPeriod);
    const emaSlow = this.calculateEMA(prices, slowPeriod);
    
    const macd: number[] = [];
    const startIndex = Math.max(0, slowPeriod - fastPeriod);
    
    for (let i = startIndex; i < Math.min(emaFast.length, emaSlow.length); i++) {
      macd.push(emaFast[i + (fastPeriod - slowPeriod)] - emaSlow[i]);
    }
    
    const signal = this.calculateEMA(macd, signalPeriod);
    const histogram = macd.slice(signalPeriod - 1).map((value, index) => value - signal[index]);
    
    return { macd, signal, histogram };
  }

  /**
   * Calculate Simple Moving Average (SMA)
   */
  static calculateSMA(prices: number[], period: number): number[] {
    if (prices.length < period) return [];
    
    const sma: number[] = [];
    
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
    
    return sma;
  }

  /**
   * Calculate Exponential Moving Average (EMA)
   */
  static calculateEMA(prices: number[], period: number): number[] {
    if (prices.length < period) return [];
    
    const ema: number[] = [];
    const multiplier = 2 / (period + 1);
    
    // Start with SMA for the first value
    const initialSMA = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
    ema.push(initialSMA);
    
    // Calculate EMA for remaining values
    for (let i = period; i < prices.length; i++) {
      const currentEMA = (prices[i] * multiplier) + (ema[ema.length - 1] * (1 - multiplier));
      ema.push(currentEMA);
    }
    
    return ema;
  }

  /**
   * Calculate Bollinger Bands
   */
  static calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2) {
    const sma = this.calculateSMA(prices, period);
    const upper: number[] = [];
    const lower: number[] = [];
    
    for (let i = period - 1; i < prices.length; i++) {
      const slice = prices.slice(i - period + 1, i + 1);
      const mean = slice.reduce((a, b) => a + b, 0) / period;
      const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period;
      const standardDeviation = Math.sqrt(variance);
      
      const smaIndex = i - period + 1;
      upper.push(sma[smaIndex] + (standardDeviation * stdDev));
      lower.push(sma[smaIndex] - (standardDeviation * stdDev));
    }
    
    return { upper, middle: sma, lower };
  }

  /**
   * Calculate Stochastic Oscillator
   */
  static calculateStochastic(highs: number[], lows: number[], closes: number[], kPeriod: number = 14, dPeriod: number = 3) {
    const k: number[] = [];
    
    for (let i = kPeriod - 1; i < closes.length; i++) {
      const highestHigh = Math.max(...highs.slice(i - kPeriod + 1, i + 1));
      const lowestLow = Math.min(...lows.slice(i - kPeriod + 1, i + 1));
      
      if (highestHigh === lowestLow) {
        k.push(50);
      } else {
        k.push(((closes[i] - lowestLow) / (highestHigh - lowestLow)) * 100);
      }
    }
    
    const d = this.calculateSMA(k, dPeriod);
    
    return { k, d };
  }

  /**
   * Calculate Average True Range (ATR)
   */
  static calculateATR(highs: number[], lows: number[], closes: number[], period: number = 14): number[] {
    if (highs.length < 2 || highs.length !== lows.length || highs.length !== closes.length) {
      return [];
    }
    
    const trueRanges: number[] = [];
    
    for (let i = 1; i < highs.length; i++) {
      const tr1 = highs[i] - lows[i];
      const tr2 = Math.abs(highs[i] - closes[i - 1]);
      const tr3 = Math.abs(lows[i] - closes[i - 1]);
      
      trueRanges.push(Math.max(tr1, tr2, tr3));
    }
    
    return this.calculateSMA(trueRanges, period);
  }

  /**
   * Calculate Average Directional Index (ADX)
   */
  static calculateADX(highs: number[], lows: number[], closes: number[], period: number = 14): number[] {
    if (highs.length < period + 1) return [];
    
    const adx: number[] = [];
    // This is a simplified ADX calculation
    // In production, you'd want a more sophisticated implementation
    
    for (let i = period; i < highs.length; i++) {
      const slice = highs.slice(i - period, i);
      const trend = slice[slice.length - 1] - slice[0];
      const volatility = Math.max(...slice) - Math.min(...slice);
      
      const adxValue = Math.abs(trend) / volatility * 100;
      adx.push(Math.min(100, Math.max(0, adxValue)));
    }
    
    return adx;
  }

  /**
   * Calculate all technical indicators for a given dataset
   */
  static calculateAll(
    prices: number[],
    highs?: number[],
    lows?: number[],
    _volumes?: number[]
  ): Partial<TechnicalIndicatorResult> {
    const result: Partial<TechnicalIndicatorResult> = {};
    
    // Price-based indicators
    result.rsi = this.calculateRSI(prices);
    result.macd = this.calculateMACD(prices);
    result.sma = {
      20: this.calculateSMA(prices, 20),
      50: this.calculateSMA(prices, 50),
      200: this.calculateSMA(prices, 200)
    };
    result.ema = {
      12: this.calculateEMA(prices, 12),
      26: this.calculateEMA(prices, 26)
    };
    result.bollingerBands = this.calculateBollingerBands(prices);
    
    // OHLC-based indicators
    if (highs && lows) {
      result.stochastic = this.calculateStochastic(highs, lows, prices);
      result.atr = this.calculateATR(highs, lows, prices);
      result.adx = this.calculateADX(highs, lows, prices);
    }
    
    return result;
  }

  /**
   * Detect chart patterns
   */
  static detectPatterns(prices: number[], highs?: number[], lows?: number[]): string[] {
    const patterns: string[] = [];
    
    if (prices.length < 20) return patterns;
    
    // Simple pattern detection
    const recent = prices.slice(-20);
    const trend = recent[recent.length - 1] - recent[0];
    const volatility = Math.max(...recent) - Math.min(...recent);
    
    if (Math.abs(trend) < volatility * 0.1) {
      patterns.push('Sideways consolidation');
    } else if (trend > 0) {
      patterns.push('Uptrend');
      if (trend > volatility * 0.5) {
        patterns.push('Strong bullish momentum');
      }
    } else {
      patterns.push('Downtrend');
      if (Math.abs(trend) > volatility * 0.5) {
        patterns.push('Strong bearish momentum');
      }
    }
    
    // Check for potential breakouts
    const recentVolatility = Math.max(...recent.slice(-5)) - Math.min(...recent.slice(-5));
    const historicalVolatility = Math.max(...recent.slice(0, 15)) - Math.min(...recent.slice(0, 15));
    
    if (recentVolatility > historicalVolatility * 1.5) {
      patterns.push('Volatility breakout');
    }
    
    return patterns;
  }
}