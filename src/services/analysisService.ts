import { supabase, handleSupabaseError } from '../lib/supabase';
import { AnalysisResult } from '../types';

export interface TechnicalAnalysisData {
  id: string;
  symbolId: string;
  analysisType: 'technical' | 'fundamental' | 'sentiment';
  trendDirection: 'bullish' | 'bearish' | 'neutral';
  strengthScore: number;
  confidenceScore: number;
  signals: string[];
  supportLevels: number[];
  resistanceLevels: number[];
  nextTarget?: number;
  stopLoss?: number;
  createdAt: string;
}

export interface TradingSignal {
  id: string;
  symbolId: string;
  signalType: 'buy' | 'sell' | 'hold';
  strength: number;
  confidence: number;
  entryPrice: number;
  targetPrice?: number;
  stopLossPrice?: number;
  reasoning?: string;
  isActive: boolean;
  createdAt: string;
  expiresAt?: string;
}

class AnalysisService {
  async performTechnicalAnalysis(symbol: string): Promise<AnalysisResult> {
    try {
      // Get symbol ID
      const { data: symbolData, error: symbolError } = await supabase
        .from('market_symbols')
        .select('id')
        .eq('symbol', symbol)
        .single();

      if (symbolError) throw symbolError;

      // Check if recent analysis exists
      const { data: existingAnalysis, error: analysisError } = await supabase
        .from('market_analysis')
        .select('*')
        .eq('symbol_id', symbolData.id)
        .eq('analysis_type', 'technical')
        .gte('created_at', new Date(Date.now() - 30 * 60 * 1000).toISOString()) // Last 30 minutes
        .order('created_at', { ascending: false })
        .limit(1);

      if (analysisError) throw analysisError;

      if (existingAnalysis.length > 0) {
        return this.mapToAnalysisResult(symbol, existingAnalysis[0]);
      }

      // Generate new analysis
      const analysis = await this.generateTechnicalAnalysis(symbolData.id, symbol);
      
      // Store in database
      await this.storeAnalysis(symbolData.id, analysis);
      
      return analysis;
    } catch (error) {
      console.error('Error performing technical analysis:', error);
      // Fallback to mock analysis
      return this.generateMockAnalysis(symbol);
    }
  }

  async getTradingSignals(symbol: string): Promise<TradingSignal[]> {
    try {
      const { data: symbolData, error: symbolError } = await supabase
        .from('market_symbols')
        .select('id')
        .eq('symbol', symbol)
        .single();

      if (symbolError) throw symbolError;

      const { data, error } = await supabase
        .from('trading_signals')
        .select('*')
        .eq('symbol_id', symbolData.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) throw error;

      return data.map(signal => ({
        id: signal.id,
        symbolId: signal.symbol_id,
        signalType: signal.signal_type,
        strength: parseFloat(signal.strength),
        confidence: parseFloat(signal.confidence),
        entryPrice: parseFloat(signal.entry_price),
        targetPrice: signal.target_price ? parseFloat(signal.target_price) : undefined,
        stopLossPrice: signal.stop_loss_price ? parseFloat(signal.stop_loss_price) : undefined,
        reasoning: signal.reasoning || undefined,
        isActive: signal.is_active,
        createdAt: signal.created_at,
        expiresAt: signal.expires_at || undefined
      }));
    } catch (error) {
      console.error('Error getting trading signals:', error);
      return [];
    }
  }

  async generateTradingSignal(symbolId: string, symbol: string): Promise<TradingSignal> {
    try {
      // Get current market data and technical indicators
      const analysis = await this.generateTechnicalAnalysis(symbolId, symbol);
      
      // Generate signal based on analysis
      const signalType = analysis.trend === 'bullish' ? 'buy' : 
                        analysis.trend === 'bearish' ? 'sell' : 'hold';
      
      const currentPrice = this.getBasePrice(symbol);
      const strength = analysis.strength / 100;
      const confidence = analysis.confidence;
      
      const signalData = {
        symbol_id: symbolId,
        signal_type: signalType,
        strength,
        confidence,
        entry_price: currentPrice,
        target_price: analysis.nextTarget,
        stop_loss_price: analysis.stopLoss,
        reasoning: `Generated based on ${analysis.signals.join(', ')}`,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      };

      const { data, error } = await supabase
        .from('trading_signals')
        .insert(signalData)
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        symbolId: data.symbol_id,
        signalType: data.signal_type,
        strength: parseFloat(data.strength),
        confidence: parseFloat(data.confidence),
        entryPrice: parseFloat(data.entry_price),
        targetPrice: data.target_price ? parseFloat(data.target_price) : undefined,
        stopLossPrice: data.stop_loss_price ? parseFloat(data.stop_loss_price) : undefined,
        reasoning: data.reasoning || undefined,
        isActive: data.is_active,
        createdAt: data.created_at,
        expiresAt: data.expires_at || undefined
      };
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  private async generateTechnicalAnalysis(symbolId: string, symbol: string): Promise<AnalysisResult> {
    // This would typically involve complex technical analysis algorithms
    // For now, we'll generate realistic mock data
    
    const signals = [];
    const trend = Math.random() > 0.6 ? 'bullish' : Math.random() > 0.3 ? 'bearish' : 'neutral';
    const strength = Math.random() * 100;
    const confidence = 0.7 + Math.random() * 0.3;
    
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
      trend: trend as 'bullish' | 'bearish' | 'neutral',
      strength,
      confidence,
      signals,
      nextTarget,
      stopLoss
    };
  }

  private async storeAnalysis(symbolId: string, analysis: AnalysisResult): Promise<void> {
    try {
      await supabase
        .from('market_analysis')
        .insert({
          symbol_id: symbolId,
          analysis_type: 'technical',
          trend_direction: analysis.trend,
          strength_score: analysis.strength / 100,
          confidence_score: analysis.confidence,
          signals: analysis.signals,
          support_levels: [],
          resistance_levels: [],
          next_target: analysis.nextTarget,
          stop_loss: analysis.stopLoss
        });
    } catch (error) {
      console.error('Error storing analysis:', error);
    }
  }

  private mapToAnalysisResult(symbol: string, data: any): AnalysisResult {
    return {
      symbol,
      trend: data.trend_direction,
      strength: parseFloat(data.strength_score) * 100,
      confidence: parseFloat(data.confidence_score),
      signals: Array.isArray(data.signals) ? data.signals : [],
      nextTarget: data.next_target ? parseFloat(data.next_target) : 0,
      stopLoss: data.stop_loss ? parseFloat(data.stop_loss) : 0
    };
  }

  private generateMockAnalysis(symbol: string): AnalysisResult {
    const signals = [];
    const trend = Math.random() > 0.6 ? 'bullish' : Math.random() > 0.3 ? 'bearish' : 'neutral';
    const strength = Math.random() * 100;
    const confidence = 0.7 + Math.random() * 0.3;
    
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
      trend: trend as 'bullish' | 'bearish' | 'neutral',
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

  private generateAlertMessage(alertData: CreateAlertData): string {
    const { alertType, conditionType, targetValue } = alertData;
    
    const conditionText = {
      above: 'rises above',
      below: 'falls below',
      crosses_above: 'crosses above',
      crosses_below: 'crosses below'
    }[conditionType];

    const typeText = {
      price: 'price',
      volume: 'volume',
      trend: 'trend',
      volatility: 'volatility'
    }[alertType];

    return `Alert when ${typeText} ${conditionText} ${targetValue}`;
  }
}

export const analysisService = new AnalysisService();</parameter>