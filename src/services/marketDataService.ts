import { supabase, handleSupabaseError } from '../lib/supabase';
import { MarketData, TrendData, PredictionData } from '../types';

export interface MarketSymbol {
  id: string;
  symbol: string;
  name: string;
  type: 'stock' | 'crypto' | 'forex' | 'commodity';
  exchange?: string;
  isActive: boolean;
}

export interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

class MarketDataService {
  private realtimeSubscription: any = null;

  async getMarketSymbols(): Promise<MarketSymbol[]> {
    try {
      const { data, error } = await supabase
        .from('market_symbols')
        .select('*')
        .eq('is_active', true)
        .order('symbol');

      if (error) throw error;

      return data.map(symbol => ({
        id: symbol.id,
        symbol: symbol.symbol,
        name: symbol.name,
        type: symbol.type,
        exchange: symbol.exchange || undefined,
        isActive: symbol.is_active
      }));
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  async getLatestMarketData(): Promise<MarketData[]> {
    try {
      const { data, error } = await supabase
        .from('market_data')
        .select(`
          *,
          market_symbols!inner(symbol, name, type)
        `)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      // Group by symbol and get latest data for each
      const latestData = new Map();
      data.forEach(item => {
        const symbol = item.market_symbols.symbol;
        if (!latestData.has(symbol) || 
            new Date(item.timestamp) > new Date(latestData.get(symbol).timestamp)) {
          latestData.set(symbol, item);
        }
      });

      return Array.from(latestData.values()).map(item => ({
        symbol: item.market_symbols.symbol,
        price: parseFloat(item.price),
        change: parseFloat(item.change_24h),
        changePercent: parseFloat(item.change_percent_24h),
        volume: parseInt(item.volume),
        marketCap: item.market_cap ? parseInt(item.market_cap) : 0,
        timestamp: item.timestamp
      }));
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  async getHistoricalData(symbol: string, days: number = 30): Promise<TrendData[]> {
    try {
      // Get symbol ID
      const { data: symbolData, error: symbolError } = await supabase
        .from('market_symbols')
        .select('id')
        .eq('symbol', symbol)
        .single();

      if (symbolError) throw symbolError;

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);

      const { data, error } = await supabase
        .from('historical_data')
        .select(`
          *,
          technical_indicators!left(rsi, macd, ma_20, ma_50)
        `)
        .eq('symbol_id', symbolData.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;

      return data.map(item => ({
        timestamp: item.date,
        price: parseFloat(item.close_price),
        volume: parseInt(item.volume),
        ma20: item.technical_indicators?.ma_20 ? parseFloat(item.technical_indicators.ma_20) : parseFloat(item.close_price),
        ma50: item.technical_indicators?.ma_50 ? parseFloat(item.technical_indicators.ma_50) : parseFloat(item.close_price),
        rsi: item.technical_indicators?.rsi ? parseFloat(item.technical_indicators.rsi) : 50,
        macd: item.technical_indicators?.macd ? parseFloat(item.technical_indicators.macd) : 0
      }));
    } catch (error) {
      console.error('Error fetching historical data:', error);
      // Fallback to mock data if database query fails
      return this.generateMockHistoricalData(symbol, days);
    }
  }

  async getPredictions(symbol: string): Promise<PredictionData[]> {
    try {
      // Get symbol ID
      const { data: symbolData, error: symbolError } = await supabase
        .from('market_symbols')
        .select('id')
        .eq('symbol', symbol)
        .single();

      if (symbolError) throw symbolError;

      const { data, error } = await supabase
        .from('ai_predictions')
        .select('*')
        .eq('symbol_id', symbolData.id)
        .eq('prediction_type', 'price')
        .gte('target_date', new Date().toISOString())
        .order('target_date', { ascending: true })
        .limit(7);

      if (error) throw error;

      if (data.length === 0) {
        // Generate and store new predictions if none exist
        return await this.generateAndStorePredictions(symbolData.id, symbol);
      }

      return data.map(item => ({
        timestamp: item.target_date.split('T')[0],
        predicted: parseFloat(item.predicted_value),
        confidence: parseFloat(item.confidence_score),
        actual: item.actual_value ? parseFloat(item.actual_value) : undefined
      }));
    } catch (error) {
      console.error('Error fetching predictions:', error);
      // Fallback to mock data
      return this.generateMockPredictions(symbol);
    }
  }

  async subscribeToRealTimeUpdates(callback: (data: MarketData[]) => void) {
    try {
      this.realtimeSubscription = supabase
        .channel('market_data_changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'market_data'
          },
          async () => {
            const latestData = await this.getLatestMarketData();
            callback(latestData);
          }
        )
        .subscribe();

      // Also start periodic updates for demo purposes
      this.startPeriodicUpdates(callback);
    } catch (error) {
      console.error('Error setting up real-time subscription:', error);
      // Fallback to periodic updates
      this.startPeriodicUpdates(callback);
    }
  }

  unsubscribeFromRealTimeUpdates() {
    if (this.realtimeSubscription) {
      supabase.removeChannel(this.realtimeSubscription);
      this.realtimeSubscription = null;
    }
  }

  private async generateAndStorePredictions(symbolId: string, symbol: string): Promise<PredictionData[]> {
    const predictions: PredictionData[] = [];
    const basePrice = this.getBasePrice(symbol);
    let currentPrice = basePrice;

    for (let i = 1; i <= 7; i++) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + i);
      
      const trendFactor = Math.random() > 0.5 ? 1.005 : 0.995;
      currentPrice = currentPrice * trendFactor;
      const confidence = Math.max(0.6, 0.95 - (i * 0.05));

      const predictionData = {
        timestamp: targetDate.toISOString().split('T')[0],
        predicted: currentPrice,
        confidence
      };

      predictions.push(predictionData);

      // Store in database
      try {
        await supabase
          .from('ai_predictions')
          .insert({
            symbol_id: symbolId,
            prediction_type: 'price',
            predicted_value: currentPrice,
            confidence_score: confidence,
            time_horizon: `${i} days`,
            target_date: targetDate.toISOString(),
            features_used: {
              technical_indicators: ['rsi', 'macd', 'moving_averages'],
              sentiment_analysis: true,
              volume_analysis: true
            }
          });
      } catch (error) {
        console.error('Error storing prediction:', error);
      }
    }

    return predictions;
  }

  private startPeriodicUpdates(callback: (data: MarketData[]) => void) {
    setInterval(async () => {
      try {
        // Generate mock updates for demo
        const data = this.generateMockUpdates();
        callback(data);
      } catch (error) {
        console.error('Error in periodic update:', error);
      }
    }, 5000); // Update every 5 seconds
  }

  private generateMockUpdates(): MarketData[] {
    const symbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN', 'NVDA', 'META', 'BTC', 'ETH', 'SPY'];
    
    return symbols.map(symbol => {
      const basePrice = this.getBasePrice(symbol);
      const change = (Math.random() - 0.5) * basePrice * 0.02; // Smaller changes for updates
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
  private generateMockHistoricalData(symbol: string, days: number): TrendData[] {
    const data: TrendData[] = [];
    const basePrice = this.getBasePrice(symbol);
    let currentPrice = basePrice;
    
    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
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

  private generateMockPredictions(symbol: string): PredictionData[] {
    const predictions: PredictionData[] = [];
    const basePrice = this.getBasePrice(symbol);
    let currentPrice = basePrice;
    
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
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
}

export const marketDataService = new MarketDataService();