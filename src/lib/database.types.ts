export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          subscription_tier: 'free' | 'premium' | 'enterprise'
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'premium' | 'enterprise'
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'premium' | 'enterprise'
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      market_symbols: {
        Row: {
          id: string
          symbol: string
          name: string
          type: 'stock' | 'crypto' | 'forex' | 'commodity'
          exchange: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          symbol: string
          name: string
          type: 'stock' | 'crypto' | 'forex' | 'commodity'
          exchange?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          symbol?: string
          name?: string
          type?: 'stock' | 'crypto' | 'forex' | 'commodity'
          exchange?: string | null
          is_active?: boolean
          created_at?: string
        }
      }
      market_data: {
        Row: {
          id: string
          symbol_id: string
          price: number
          volume: number
          market_cap: number | null
          change_24h: number
          change_percent_24h: number
          timestamp: string
        }
        Insert: {
          id?: string
          symbol_id: string
          price: number
          volume?: number
          market_cap?: number | null
          change_24h?: number
          change_percent_24h?: number
          timestamp?: string
        }
        Update: {
          id?: string
          symbol_id?: string
          price?: number
          volume?: number
          market_cap?: number | null
          change_24h?: number
          change_percent_24h?: number
          timestamp?: string
        }
      }
      historical_data: {
        Row: {
          id: string
          symbol_id: string
          open_price: number
          high_price: number
          low_price: number
          close_price: number
          volume: number
          date: string
        }
        Insert: {
          id?: string
          symbol_id: string
          open_price: number
          high_price: number
          low_price: number
          close_price: number
          volume?: number
          date: string
        }
        Update: {
          id?: string
          symbol_id?: string
          open_price?: number
          high_price?: number
          low_price?: number
          close_price?: number
          volume?: number
          date?: string
        }
      }
      technical_indicators: {
        Row: {
          id: string
          symbol_id: string
          rsi: number | null
          macd: number | null
          macd_signal: number | null
          ma_20: number | null
          ma_50: number | null
          ma_200: number | null
          bollinger_upper: number | null
          bollinger_lower: number | null
          timestamp: string
        }
        Insert: {
          id?: string
          symbol_id: string
          rsi?: number | null
          macd?: number | null
          macd_signal?: number | null
          ma_20?: number | null
          ma_50?: number | null
          ma_200?: number | null
          bollinger_upper?: number | null
          bollinger_lower?: number | null
          timestamp?: string
        }
        Update: {
          id?: string
          symbol_id?: string
          rsi?: number | null
          macd?: number | null
          macd_signal?: number | null
          ma_20?: number | null
          ma_50?: number | null
          ma_200?: number | null
          bollinger_upper?: number | null
          bollinger_lower?: number | null
          timestamp?: string
        }
      }
      user_alerts: {
        Row: {
          id: string
          user_id: string
          symbol_id: string
          alert_type: 'price' | 'volume' | 'trend' | 'volatility'
          condition_type: 'above' | 'below' | 'crosses_above' | 'crosses_below'
          target_value: number
          current_value: number | null
          is_triggered: boolean
          is_active: boolean
          message: string | null
          severity: 'low' | 'medium' | 'high'
          triggered_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          symbol_id: string
          alert_type: 'price' | 'volume' | 'trend' | 'volatility'
          condition_type: 'above' | 'below' | 'crosses_above' | 'crosses_below'
          target_value: number
          current_value?: number | null
          is_triggered?: boolean
          is_active?: boolean
          message?: string | null
          severity?: 'low' | 'medium' | 'high'
          triggered_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          symbol_id?: string
          alert_type?: 'price' | 'volume' | 'trend' | 'volatility'
          condition_type?: 'above' | 'below' | 'crosses_above' | 'crosses_below'
          target_value?: number
          current_value?: number | null
          is_triggered?: boolean
          is_active?: boolean
          message?: string | null
          severity?: 'low' | 'medium' | 'high'
          triggered_at?: string | null
          created_at?: string
        }
      }
      ai_predictions: {
        Row: {
          id: string
          symbol_id: string
          prediction_type: 'price' | 'trend' | 'volatility'
          predicted_value: number
          confidence_score: number
          time_horizon: string
          model_version: string
          features_used: Json
          actual_value: number | null
          accuracy_score: number | null
          created_at: string
          target_date: string
        }
        Insert: {
          id?: string
          symbol_id: string
          prediction_type: 'price' | 'trend' | 'volatility'
          predicted_value: number
          confidence_score: number
          time_horizon: string
          model_version?: string
          features_used?: Json
          actual_value?: number | null
          accuracy_score?: number | null
          created_at?: string
          target_date: string
        }
        Update: {
          id?: string
          symbol_id?: string
          prediction_type?: 'price' | 'trend' | 'volatility'
          predicted_value?: number
          confidence_score?: number
          time_horizon?: string
          model_version?: string
          features_used?: Json
          actual_value?: number | null
          accuracy_score?: number | null
          created_at?: string
          target_date?: string
        }
      }
      user_portfolios: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          is_default: boolean
          total_value: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          is_default?: boolean
          total_value?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          is_default?: boolean
          total_value?: number
          created_at?: string
          updated_at?: string
        }
      }
      portfolio_holdings: {
        Row: {
          id: string
          portfolio_id: string
          symbol_id: string
          quantity: number
          average_cost: number
          current_value: number
          last_updated: string
        }
        Insert: {
          id?: string
          portfolio_id: string
          symbol_id: string
          quantity?: number
          average_cost?: number
          current_value?: number
          last_updated?: string
        }
        Update: {
          id?: string
          portfolio_id?: string
          symbol_id?: string
          quantity?: number
          average_cost?: number
          current_value?: number
          last_updated?: string
        }
      }
      market_analysis: {
        Row: {
          id: string
          symbol_id: string
          analysis_type: 'technical' | 'fundamental' | 'sentiment'
          trend_direction: 'bullish' | 'bearish' | 'neutral'
          strength_score: number
          confidence_score: number
          signals: Json
          support_levels: number[]
          resistance_levels: number[]
          next_target: number | null
          stop_loss: number | null
          created_at: string
        }
        Insert: {
          id?: string
          symbol_id: string
          analysis_type: 'technical' | 'fundamental' | 'sentiment'
          trend_direction: 'bullish' | 'bearish' | 'neutral'
          strength_score: number
          confidence_score: number
          signals?: Json
          support_levels?: number[]
          resistance_levels?: number[]
          next_target?: number | null
          stop_loss?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          symbol_id?: string
          analysis_type?: 'technical' | 'fundamental' | 'sentiment'
          trend_direction?: 'bullish' | 'bearish' | 'neutral'
          strength_score?: number
          confidence_score?: number
          signals?: Json
          support_levels?: number[]
          resistance_levels?: number[]
          next_target?: number | null
          stop_loss?: number | null
          created_at?: string
        }
      }
      news_sentiment: {
        Row: {
          id: string
          symbol_id: string
          headline: string
          content: string | null
          source: string
          sentiment_score: number
          sentiment_label: 'positive' | 'negative' | 'neutral'
          relevance_score: number
          published_at: string
          created_at: string
        }
        Insert: {
          id?: string
          symbol_id: string
          headline: string
          content?: string | null
          source: string
          sentiment_score: number
          sentiment_label: 'positive' | 'negative' | 'neutral'
          relevance_score?: number
          published_at: string
          created_at?: string
        }
        Update: {
          id?: string
          symbol_id?: string
          headline?: string
          content?: string | null
          source?: string
          sentiment_score?: number
          sentiment_label?: 'positive' | 'negative' | 'neutral'
          relevance_score?: number
          published_at?: string
          created_at?: string
        }
      }
      trading_signals: {
        Row: {
          id: string
          symbol_id: string
          signal_type: 'buy' | 'sell' | 'hold'
          strength: number
          confidence: number
          entry_price: number
          target_price: number | null
          stop_loss_price: number | null
          reasoning: string | null
          is_active: boolean
          created_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          symbol_id: string
          signal_type: 'buy' | 'sell' | 'hold'
          strength: number
          confidence: number
          entry_price: number
          target_price?: number | null
          stop_loss_price?: number | null
          reasoning?: string | null
          is_active?: boolean
          created_at?: string
          expires_at?: string | null
        }
        Update: {
          id?: string
          symbol_id?: string
          signal_type?: 'buy' | 'sell' | 'hold'
          strength?: number
          confidence?: number
          entry_price?: number
          target_price?: number | null
          stop_loss_price?: number | null
          reasoning?: string | null
          is_active?: boolean
          created_at?: string
          expires_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      subscription_tier: 'free' | 'premium' | 'enterprise'
      symbol_type: 'stock' | 'crypto' | 'forex' | 'commodity'
      alert_type: 'price' | 'volume' | 'trend' | 'volatility'
      condition_type: 'above' | 'below' | 'crosses_above' | 'crosses_below'
      severity_level: 'low' | 'medium' | 'high'
      prediction_type: 'price' | 'trend' | 'volatility'
      analysis_type: 'technical' | 'fundamental' | 'sentiment'
      trend_direction: 'bullish' | 'bearish' | 'neutral'
      sentiment_label: 'positive' | 'negative' | 'neutral'
      signal_type: 'buy' | 'sell' | 'hold'
    }
  }
}</parameter>