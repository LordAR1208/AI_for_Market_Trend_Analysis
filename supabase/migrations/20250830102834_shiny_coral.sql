/*
  # Alerts and Predictions Schema

  1. New Tables
    - `user_alerts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `symbol_id` (uuid, foreign key)
      - `alert_type` (enum: price, volume, trend, volatility)
      - `condition_type` (enum: above, below, crosses_above, crosses_below)
      - `target_value` (decimal)
      - `current_value` (decimal)
      - `is_triggered` (boolean)
      - `is_active` (boolean)
      - `message` (text)
      - `severity` (enum: low, medium, high)
      - `triggered_at` (timestamp, optional)
      - `created_at` (timestamp)

    - `ai_predictions`
      - `id` (uuid, primary key)
      - `symbol_id` (uuid, foreign key)
      - `prediction_type` (enum: price, trend, volatility)
      - `predicted_value` (decimal)
      - `confidence_score` (decimal)
      - `time_horizon` (interval)
      - `model_version` (text)
      - `features_used` (jsonb)
      - `actual_value` (decimal, optional)
      - `accuracy_score` (decimal, optional)
      - `created_at` (timestamp)
      - `target_date` (timestamp)

    - `user_portfolios`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `name` (text)
      - `description` (text, optional)
      - `is_default` (boolean)
      - `total_value` (decimal)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `portfolio_holdings`
      - `id` (uuid, primary key)
      - `portfolio_id` (uuid, foreign key)
      - `symbol_id` (uuid, foreign key)
      - `quantity` (decimal)
      - `average_cost` (decimal)
      - `current_value` (decimal)
      - `last_updated` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for user-specific data access
    - Create indexes for performance optimization
*/

-- Create alert type enums
CREATE TYPE alert_type AS ENUM ('price', 'volume', 'trend', 'volatility');
CREATE TYPE condition_type AS ENUM ('above', 'below', 'crosses_above', 'crosses_below');
CREATE TYPE severity_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE prediction_type AS ENUM ('price', 'trend', 'volatility');

-- Create user alerts table
CREATE TABLE IF NOT EXISTS user_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  symbol_id uuid REFERENCES market_symbols(id) ON DELETE CASCADE,
  alert_type alert_type NOT NULL,
  condition_type condition_type NOT NULL,
  target_value decimal(20, 8) NOT NULL,
  current_value decimal(20, 8),
  is_triggered boolean DEFAULT false,
  is_active boolean DEFAULT true,
  message text,
  severity severity_level DEFAULT 'medium',
  triggered_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create AI predictions table
CREATE TABLE IF NOT EXISTS ai_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol_id uuid REFERENCES market_symbols(id) ON DELETE CASCADE,
  prediction_type prediction_type NOT NULL,
  predicted_value decimal(20, 8) NOT NULL,
  confidence_score decimal(5, 4) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  time_horizon interval NOT NULL,
  model_version text DEFAULT 'v1.0',
  features_used jsonb DEFAULT '{}',
  actual_value decimal(20, 8),
  accuracy_score decimal(5, 4),
  created_at timestamptz DEFAULT now(),
  target_date timestamptz NOT NULL
);

-- Create user portfolios table
CREATE TABLE IF NOT EXISTS user_portfolios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_default boolean DEFAULT false,
  total_value decimal(20, 8) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create portfolio holdings table
CREATE TABLE IF NOT EXISTS portfolio_holdings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id uuid REFERENCES user_portfolios(id) ON DELETE CASCADE,
  symbol_id uuid REFERENCES market_symbols(id) ON DELETE CASCADE,
  quantity decimal(20, 8) NOT NULL DEFAULT 0,
  average_cost decimal(20, 8) NOT NULL DEFAULT 0,
  current_value decimal(20, 8) DEFAULT 0,
  last_updated timestamptz DEFAULT now(),
  UNIQUE(portfolio_id, symbol_id)
);

-- Enable RLS
ALTER TABLE user_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_holdings ENABLE ROW LEVEL SECURITY;

-- Create policies for user alerts
CREATE POLICY "Users can manage own alerts"
  ON user_alerts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for AI predictions
CREATE POLICY "Anyone can read AI predictions"
  ON ai_predictions
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- Create policies for user portfolios
CREATE POLICY "Users can manage own portfolios"
  ON user_portfolios
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for portfolio holdings
CREATE POLICY "Users can manage own portfolio holdings"
  ON portfolio_holdings
  FOR ALL
  TO authenticated
  USING (
    portfolio_id IN (
      SELECT id FROM user_portfolios WHERE user_id = auth.uid()
    )
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_alerts_user_symbol ON user_alerts(user_id, symbol_id);
CREATE INDEX IF NOT EXISTS idx_user_alerts_active ON user_alerts(is_active, is_triggered);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_symbol_date ON ai_predictions(symbol_id, target_date);
CREATE INDEX IF NOT EXISTS idx_user_portfolios_user ON user_portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_portfolio ON portfolio_holdings(portfolio_id);

-- Create function to update portfolio total value
CREATE OR REPLACE FUNCTION update_portfolio_total_value()
RETURNS trigger AS $$
BEGIN
  UPDATE user_portfolios
  SET 
    total_value = (
      SELECT COALESCE(SUM(current_value), 0)
      FROM portfolio_holdings
      WHERE portfolio_id = COALESCE(NEW.portfolio_id, OLD.portfolio_id)
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.portfolio_id, OLD.portfolio_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update portfolio value
DROP TRIGGER IF EXISTS update_portfolio_value_trigger ON portfolio_holdings;
CREATE TRIGGER update_portfolio_value_trigger
  AFTER INSERT OR UPDATE OR DELETE ON portfolio_holdings
  FOR EACH ROW EXECUTE FUNCTION update_portfolio_total_value();</parameter>