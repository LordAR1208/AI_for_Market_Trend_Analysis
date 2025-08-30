/*
  # Market Data Schema

  1. New Tables
    - `market_symbols`
      - `id` (uuid, primary key)
      - `symbol` (text, unique, e.g., 'AAPL', 'BTC')
      - `name` (text, e.g., 'Apple Inc.')
      - `type` (enum: stock, crypto, forex, commodity)
      - `exchange` (text, nullable)
      - `is_active` (boolean, default true)
      - `created_at` (timestamptz)

    - `market_data`
      - `id` (uuid, primary key)
      - `symbol_id` (uuid, foreign key to market_symbols)
      - `price` (numeric, current price)
      - `volume` (bigint, trading volume)
      - `market_cap` (bigint, nullable)
      - `change_24h` (numeric, 24h price change)
      - `change_percent_24h` (numeric, 24h percentage change)
      - `timestamp` (timestamptz)

    - `historical_data`
      - `id` (uuid, primary key)
      - `symbol_id` (uuid, foreign key to market_symbols)
      - `open_price` (numeric)
      - `high_price` (numeric)
      - `low_price` (numeric)
      - `close_price` (numeric)
      - `volume` (bigint)
      - `date` (date, unique per symbol)

    - `technical_indicators`
      - `id` (uuid, primary key)
      - `symbol_id` (uuid, foreign key to market_symbols)
      - `rsi` (numeric, nullable)
      - `macd` (numeric, nullable)
      - `macd_signal` (numeric, nullable)
      - `ma_20` (numeric, nullable)
      - `ma_50` (numeric, nullable)
      - `ma_200` (numeric, nullable)
      - `bollinger_upper` (numeric, nullable)
      - `bollinger_lower` (numeric, nullable)
      - `timestamp` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access to market data
    - Restrict write access to service role only

  3. Indexes
    - Performance indexes for common queries
    - Unique constraints where appropriate
*/

-- Create enums
CREATE TYPE symbol_type AS ENUM ('stock', 'crypto', 'forex', 'commodity');

-- Create market_symbols table
CREATE TABLE IF NOT EXISTS market_symbols (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text UNIQUE NOT NULL,
  name text NOT NULL,
  type symbol_type NOT NULL,
  exchange text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create market_data table
CREATE TABLE IF NOT EXISTS market_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol_id uuid NOT NULL REFERENCES market_symbols(id) ON DELETE CASCADE,
  price numeric NOT NULL CHECK (price > 0),
  volume bigint DEFAULT 0 CHECK (volume >= 0),
  market_cap bigint,
  change_24h numeric DEFAULT 0,
  change_percent_24h numeric DEFAULT 0,
  timestamp timestamptz DEFAULT now()
);

-- Create historical_data table
CREATE TABLE IF NOT EXISTS historical_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol_id uuid NOT NULL REFERENCES market_symbols(id) ON DELETE CASCADE,
  open_price numeric NOT NULL CHECK (open_price > 0),
  high_price numeric NOT NULL CHECK (high_price > 0),
  low_price numeric NOT NULL CHECK (low_price > 0),
  close_price numeric NOT NULL CHECK (close_price > 0),
  volume bigint DEFAULT 0 CHECK (volume >= 0),
  date date NOT NULL,
  UNIQUE(symbol_id, date)
);

-- Create technical_indicators table
CREATE TABLE IF NOT EXISTS technical_indicators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol_id uuid NOT NULL REFERENCES market_symbols(id) ON DELETE CASCADE,
  rsi numeric CHECK (rsi >= 0 AND rsi <= 100),
  macd numeric,
  macd_signal numeric,
  ma_20 numeric,
  ma_50 numeric,
  ma_200 numeric,
  bollinger_upper numeric,
  bollinger_lower numeric,
  timestamp timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE market_symbols ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE historical_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE technical_indicators ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Public read access to market symbols"
  ON market_symbols
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access to market data"
  ON market_data
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access to historical data"
  ON historical_data
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Public read access to technical indicators"
  ON technical_indicators
  FOR SELECT
  TO public
  USING (true);

-- Service role policies for write operations
CREATE POLICY "Service role can insert market data"
  ON market_data
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can update market data"
  ON market_data
  FOR UPDATE
  TO service_role
  USING (true);

CREATE POLICY "Service role can insert historical data"
  ON historical_data
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "Service role can insert technical indicators"
  ON technical_indicators
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_market_data_symbol_timestamp 
  ON market_data(symbol_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_historical_data_symbol_date 
  ON historical_data(symbol_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_technical_indicators_symbol_timestamp 
  ON technical_indicators(symbol_id, timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_market_symbols_symbol 
  ON market_symbols(symbol);

CREATE INDEX IF NOT EXISTS idx_market_symbols_type 
  ON market_symbols(type);

-- Insert sample market symbols
INSERT INTO market_symbols (symbol, name, type, exchange) VALUES
  ('AAPL', 'Apple Inc.', 'stock', 'NASDAQ'),
  ('GOOGL', 'Alphabet Inc.', 'stock', 'NASDAQ'),
  ('MSFT', 'Microsoft Corporation', 'stock', 'NASDAQ'),
  ('TSLA', 'Tesla Inc.', 'stock', 'NASDAQ'),
  ('AMZN', 'Amazon.com Inc.', 'stock', 'NASDAQ'),
  ('NVDA', 'NVIDIA Corporation', 'stock', 'NASDAQ'),
  ('META', 'Meta Platforms Inc.', 'stock', 'NASDAQ'),
  ('BTC', 'Bitcoin', 'crypto', 'Crypto'),
  ('ETH', 'Ethereum', 'crypto', 'Crypto'),
  ('SPY', 'SPDR S&P 500 ETF', 'stock', 'NYSE')
ON CONFLICT (symbol) DO NOTHING;