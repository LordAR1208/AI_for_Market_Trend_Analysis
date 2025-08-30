/*
  # Market Data Schema

  1. New Tables
    - `market_symbols`
      - `id` (uuid, primary key)
      - `symbol` (text, unique)
      - `name` (text)
      - `type` (enum: stock, crypto, forex, commodity)
      - `exchange` (text)
      - `is_active` (boolean)
      - `created_at` (timestamp)

    - `market_data`
      - `id` (uuid, primary key)
      - `symbol_id` (uuid, foreign key)
      - `price` (decimal)
      - `volume` (bigint)
      - `market_cap` (bigint, optional)
      - `change_24h` (decimal)
      - `change_percent_24h` (decimal)
      - `timestamp` (timestamp)

    - `historical_data`
      - `id` (uuid, primary key)
      - `symbol_id` (uuid, foreign key)
      - `open_price` (decimal)
      - `high_price` (decimal)
      - `low_price` (decimal)
      - `close_price` (decimal)
      - `volume` (bigint)
      - `date` (date)

    - `technical_indicators`
      - `id` (uuid, primary key)
      - `symbol_id` (uuid, foreign key)
      - `rsi` (decimal)
      - `macd` (decimal)
      - `macd_signal` (decimal)
      - `ma_20` (decimal)
      - `ma_50` (decimal)
      - `ma_200` (decimal)
      - `bollinger_upper` (decimal)
      - `bollinger_lower` (decimal)
      - `timestamp` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read market data
    - Create indexes for performance optimization
*/

-- Create market symbol type enum
CREATE TYPE symbol_type AS ENUM ('stock', 'crypto', 'forex', 'commodity');

-- Create market symbols table
CREATE TABLE IF NOT EXISTS market_symbols (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text UNIQUE NOT NULL,
  name text NOT NULL,
  type symbol_type NOT NULL,
  exchange text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create market data table
CREATE TABLE IF NOT EXISTS market_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol_id uuid REFERENCES market_symbols(id) ON DELETE CASCADE,
  price decimal(20, 8) NOT NULL,
  volume bigint DEFAULT 0,
  market_cap bigint,
  change_24h decimal(20, 8) DEFAULT 0,
  change_percent_24h decimal(10, 4) DEFAULT 0,
  timestamp timestamptz DEFAULT now()
);

-- Create historical data table
CREATE TABLE IF NOT EXISTS historical_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol_id uuid REFERENCES market_symbols(id) ON DELETE CASCADE,
  open_price decimal(20, 8) NOT NULL,
  high_price decimal(20, 8) NOT NULL,
  low_price decimal(20, 8) NOT NULL,
  close_price decimal(20, 8) NOT NULL,
  volume bigint DEFAULT 0,
  date date NOT NULL,
  UNIQUE(symbol_id, date)
);

-- Create technical indicators table
CREATE TABLE IF NOT EXISTS technical_indicators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol_id uuid REFERENCES market_symbols(id) ON DELETE CASCADE,
  rsi decimal(10, 4),
  macd decimal(20, 8),
  macd_signal decimal(20, 8),
  ma_20 decimal(20, 8),
  ma_50 decimal(20, 8),
  ma_200 decimal(20, 8),
  bollinger_upper decimal(20, 8),
  bollinger_lower decimal(20, 8),
  timestamp timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE market_symbols ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE historical_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE technical_indicators ENABLE ROW LEVEL SECURITY;

-- Create policies for market symbols
CREATE POLICY "Anyone can read market symbols"
  ON market_symbols
  FOR SELECT
  TO authenticated, anon
  USING (is_active = true);

-- Create policies for market data
CREATE POLICY "Anyone can read market data"
  ON market_data
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Create policies for historical data
CREATE POLICY "Anyone can read historical data"
  ON historical_data
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Create policies for technical indicators
CREATE POLICY "Anyone can read technical indicators"
  ON technical_indicators
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_market_data_symbol_timestamp ON market_data(symbol_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_historical_data_symbol_date ON historical_data(symbol_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_technical_indicators_symbol_timestamp ON technical_indicators(symbol_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_market_symbols_type ON market_symbols(type);
CREATE INDEX IF NOT EXISTS idx_market_symbols_active ON market_symbols(is_active);

-- Insert sample market symbols
INSERT INTO market_symbols (symbol, name, type, exchange) VALUES
  ('AAPL', 'Apple Inc.', 'stock', 'NASDAQ'),
  ('GOOGL', 'Alphabet Inc.', 'stock', 'NASDAQ'),
  ('MSFT', 'Microsoft Corporation', 'stock', 'NASDAQ'),
  ('TSLA', 'Tesla Inc.', 'stock', 'NASDAQ'),
  ('AMZN', 'Amazon.com Inc.', 'stock', 'NASDAQ'),
  ('NVDA', 'NVIDIA Corporation', 'stock', 'NASDAQ'),
  ('META', 'Meta Platforms Inc.', 'stock', 'NASDAQ'),
  ('BTC', 'Bitcoin', 'crypto', 'Binance'),
  ('ETH', 'Ethereum', 'crypto', 'Binance'),
  ('SPY', 'SPDR S&P 500 ETF', 'stock', 'NYSE')
ON CONFLICT (symbol) DO NOTHING;</parameter>