/*
  # Analytics and Portfolio Schema

  1. New Tables
    - `user_portfolios`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `name` (text)
      - `description` (text, nullable)
      - `is_default` (boolean, default false)
      - `total_value` (numeric, default 0)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `portfolio_holdings`
      - `id` (uuid, primary key)
      - `portfolio_id` (uuid, foreign key to user_portfolios)
      - `symbol_id` (uuid, foreign key to market_symbols)
      - `quantity` (numeric, default 0)
      - `average_cost` (numeric, default 0)
      - `current_value` (numeric, default 0)
      - `last_updated` (timestamptz)

    - `market_analysis`
      - `id` (uuid, primary key)
      - `symbol_id` (uuid, foreign key to market_symbols)
      - `analysis_type` (enum: technical, fundamental, sentiment)
      - `trend_direction` (enum: bullish, bearish, neutral)
      - `strength_score` (numeric, 0-1)
      - `confidence_score` (numeric, 0-1)
      - `signals` (jsonb, array of signals)
      - `support_levels` (numeric array)
      - `resistance_levels` (numeric array)
      - `next_target` (numeric, nullable)
      - `stop_loss` (numeric, nullable)
      - `created_at` (timestamptz)

    - `news_sentiment`
      - `id` (uuid, primary key)
      - `symbol_id` (uuid, foreign key to market_symbols)
      - `headline` (text)
      - `content` (text, nullable)
      - `source` (text)
      - `sentiment_score` (numeric, -1 to 1)
      - `sentiment_label` (enum: positive, negative, neutral)
      - `relevance_score` (numeric, 0-1, default 0.5)
      - `published_at` (timestamptz)
      - `created_at` (timestamptz)

    - `trading_signals`
      - `id` (uuid, primary key)
      - `symbol_id` (uuid, foreign key to market_symbols)
      - `signal_type` (enum: buy, sell, hold)
      - `strength` (numeric, 0-1)
      - `confidence` (numeric, 0-1)
      - `entry_price` (numeric)
      - `target_price` (numeric, nullable)
      - `stop_loss_price` (numeric, nullable)
      - `reasoning` (text, nullable)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz)
      - `expires_at` (timestamptz, nullable)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own portfolios
    - Public read access to analysis and signals

  3. Indexes
    - Performance indexes for common queries
*/

-- Create additional enums
CREATE TYPE analysis_type AS ENUM ('technical', 'fundamental', 'sentiment');
CREATE TYPE trend_direction AS ENUM ('bullish', 'bearish', 'neutral');
CREATE TYPE sentiment_label AS ENUM ('positive', 'negative', 'neutral');
CREATE TYPE signal_type AS ENUM ('buy', 'sell', 'hold');

-- Create user_portfolios table
CREATE TABLE IF NOT EXISTS user_portfolios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_default boolean DEFAULT false,
  total_value numeric DEFAULT 0 CHECK (total_value >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create portfolio_holdings table
CREATE TABLE IF NOT EXISTS portfolio_holdings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id uuid NOT NULL REFERENCES user_portfolios(id) ON DELETE CASCADE,
  symbol_id uuid NOT NULL REFERENCES market_symbols(id) ON DELETE CASCADE,
  quantity numeric DEFAULT 0 CHECK (quantity >= 0),
  average_cost numeric DEFAULT 0 CHECK (average_cost >= 0),
  current_value numeric DEFAULT 0 CHECK (current_value >= 0),
  last_updated timestamptz DEFAULT now(),
  UNIQUE(portfolio_id, symbol_id)
);

-- Create market_analysis table
CREATE TABLE IF NOT EXISTS market_analysis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol_id uuid NOT NULL REFERENCES market_symbols(id) ON DELETE CASCADE,
  analysis_type analysis_type NOT NULL,
  trend_direction trend_direction NOT NULL,
  strength_score numeric NOT NULL CHECK (strength_score >= 0 AND strength_score <= 1),
  confidence_score numeric NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  signals jsonb DEFAULT '[]',
  support_levels numeric[] DEFAULT '{}',
  resistance_levels numeric[] DEFAULT '{}',
  next_target numeric,
  stop_loss numeric,
  created_at timestamptz DEFAULT now()
);

-- Create news_sentiment table
CREATE TABLE IF NOT EXISTS news_sentiment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol_id uuid NOT NULL REFERENCES market_symbols(id) ON DELETE CASCADE,
  headline text NOT NULL,
  content text,
  source text NOT NULL,
  sentiment_score numeric NOT NULL CHECK (sentiment_score >= -1 AND sentiment_score <= 1),
  sentiment_label sentiment_label NOT NULL,
  relevance_score numeric DEFAULT 0.5 CHECK (relevance_score >= 0 AND relevance_score <= 1),
  published_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create trading_signals table
CREATE TABLE IF NOT EXISTS trading_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol_id uuid NOT NULL REFERENCES market_symbols(id) ON DELETE CASCADE,
  signal_type signal_type NOT NULL,
  strength numeric NOT NULL CHECK (strength >= 0 AND strength <= 1),
  confidence numeric NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  entry_price numeric NOT NULL CHECK (entry_price > 0),
  target_price numeric CHECK (target_price > 0),
  stop_loss_price numeric CHECK (stop_loss_price > 0),
  reasoning text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz
);

-- Enable RLS
ALTER TABLE user_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_sentiment ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_signals ENABLE ROW LEVEL SECURITY;

-- Portfolio policies
CREATE POLICY "Users can read own portfolios"
  ON user_portfolios
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own portfolios"
  ON user_portfolios
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read own holdings"
  ON portfolio_holdings
  FOR SELECT
  TO authenticated
  USING (
    portfolio_id IN (
      SELECT id FROM user_portfolios WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own holdings"
  ON portfolio_holdings
  FOR ALL
  TO authenticated
  USING (
    portfolio_id IN (
      SELECT id FROM user_portfolios WHERE user_id = auth.uid()
    )
  );

-- Analysis and signals policies (public read)
CREATE POLICY "Public read access to market analysis"
  ON market_analysis
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access to news sentiment"
  ON news_sentiment
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access to trading signals"
  ON trading_signals
  FOR SELECT
  TO public
  USING (true);

-- Service role policies
CREATE POLICY "Service role can manage analysis"
  ON market_analysis
  FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Service role can manage news sentiment"
  ON news_sentiment
  FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Service role can manage trading signals"
  ON trading_signals
  FOR ALL
  TO service_role
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_portfolios_user_id 
  ON user_portfolios(user_id);

CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_portfolio_id 
  ON portfolio_holdings(portfolio_id);

CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_symbol_id 
  ON portfolio_holdings(symbol_id);

CREATE INDEX IF NOT EXISTS idx_market_analysis_symbol_type 
  ON market_analysis(symbol_id, analysis_type);

CREATE INDEX IF NOT EXISTS idx_news_sentiment_symbol_published 
  ON news_sentiment(symbol_id, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_trading_signals_symbol_active 
  ON trading_signals(symbol_id, is_active);

-- Trigger for portfolio updated_at
CREATE TRIGGER update_user_portfolios_updated_at
  BEFORE UPDATE ON user_portfolios
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for holdings last_updated
CREATE OR REPLACE FUNCTION update_last_updated_column()
RETURNS trigger AS $$
BEGIN
  NEW.last_updated = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_portfolio_holdings_last_updated
  BEFORE UPDATE ON portfolio_holdings
  FOR EACH ROW EXECUTE FUNCTION update_last_updated_column();