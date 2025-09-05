/*
  # Analytics and Reporting Schema

  1. New Tables
    - `market_analysis`
      - `id` (uuid, primary key)
      - `symbol_id` (uuid, foreign key)
      - `analysis_type` (enum: technical, fundamental, sentiment)
      - `trend_direction` (enum: bullish, bearish, neutral)
      - `strength_score` (decimal)
      - `confidence_score` (decimal)
      - `signals` (jsonb array)
      - `support_levels` (decimal array)
      - `resistance_levels` (decimal array)
      - `next_target` (decimal)
      - `stop_loss` (decimal)
      - `created_at` (timestamp)

    - `news_sentiment`
      - `id` (uuid, primary key)
      - `symbol_id` (uuid, foreign key)
      - `headline` (text)
      - `content` (text)
      - `source` (text)
      - `sentiment_score` (decimal)
      - `sentiment_label` (enum: positive, negative, neutral)
      - `relevance_score` (decimal)
      - `published_at` (timestamp)
      - `created_at` (timestamp)

    - `trading_signals`
      - `id` (uuid, primary key)
      - `symbol_id` (uuid, foreign key)
      - `signal_type` (enum: buy, sell, hold)
      - `strength` (decimal)
      - `confidence` (decimal)
      - `entry_price` (decimal)
      - `target_price` (decimal)
      - `stop_loss_price` (decimal)
      - `reasoning` (text)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `expires_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Create indexes for performance optimization
*/

-- Create analysis type enums
CREATE TYPE analysis_type AS ENUM ('technical', 'fundamental', 'sentiment');
CREATE TYPE trend_direction AS ENUM ('bullish', 'bearish', 'neutral');
CREATE TYPE sentiment_label AS ENUM ('positive', 'negative', 'neutral');
CREATE TYPE signal_type AS ENUM ('buy', 'sell', 'hold');

-- Create market analysis table
CREATE TABLE IF NOT EXISTS market_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol_id uuid REFERENCES market_symbols(id) ON DELETE CASCADE,
  analysis_type analysis_type NOT NULL,
  trend_direction trend_direction NOT NULL,
  strength_score decimal(5, 4) NOT NULL CHECK (strength_score >= 0 AND strength_score <= 1),
  confidence_score decimal(5, 4) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  signals jsonb DEFAULT '[]',
  support_levels decimal(20, 8)[] DEFAULT '{}',
  resistance_levels decimal(20, 8)[] DEFAULT '{}',
  next_target decimal(20, 8),
  stop_loss decimal(20, 8),
  created_at timestamptz DEFAULT now()
);

-- Create news sentiment table
CREATE TABLE IF NOT EXISTS news_sentiment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol_id uuid REFERENCES market_symbols(id) ON DELETE CASCADE,
  headline text NOT NULL,
  content text,
  source text NOT NULL,
  sentiment_score decimal(5, 4) NOT NULL CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  sentiment_label sentiment_label NOT NULL,
  relevance_score decimal(5, 4) DEFAULT 0.5,
  published_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create trading signals table
CREATE TABLE IF NOT EXISTS trading_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol_id uuid REFERENCES market_symbols(id) ON DELETE CASCADE,
  signal_type signal_type NOT NULL,
  strength decimal(5, 4) NOT NULL CHECK (strength >= 0 AND strength <= 1),
  confidence decimal(5, 4) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  entry_price decimal(20, 8) NOT NULL,
  target_price decimal(20, 8),
  stop_loss_price decimal(20, 8),
  reasoning text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- Enable RLS
ALTER TABLE market_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_sentiment ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_signals ENABLE ROW LEVEL SECURITY;

-- Create policies for market analysis
CREATE POLICY "Anyone can read market analysis"
  ON market_analysis
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Create policies for news sentiment
CREATE POLICY "Anyone can read news sentiment"
  ON news_sentiment
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Create policies for trading signals
CREATE POLICY "Anyone can read trading signals"
  ON trading_signals
  FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_market_analysis_symbol_created ON market_analysis(symbol_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_sentiment_symbol_published ON news_sentiment(symbol_id, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_trading_signals_symbol_active ON trading_signals(symbol_id, is_active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_sentiment_score ON news_sentiment(sentiment_score);
CREATE INDEX IF NOT EXISTS idx_trading_signals_type ON trading_signals(signal_type);</parameter>