/*
  # Alerts and Predictions Schema

  1. New Tables
    - `user_alerts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to user_profiles)
      - `symbol_id` (uuid, foreign key to market_symbols)
      - `alert_type` (enum: price, volume, trend, volatility)
      - `condition_type` (enum: above, below, crosses_above, crosses_below)
      - `target_value` (numeric)
      - `current_value` (numeric, nullable)
      - `is_triggered` (boolean, default false)
      - `is_active` (boolean, default true)
      - `message` (text, nullable)
      - `severity` (enum: low, medium, high)
      - `triggered_at` (timestamptz, nullable)
      - `created_at` (timestamptz)

    - `ai_predictions`
      - `id` (uuid, primary key)
      - `symbol_id` (uuid, foreign key to market_symbols)
      - `prediction_type` (enum: price, trend, volatility)
      - `predicted_value` (numeric)
      - `confidence_score` (numeric, 0-1)
      - `time_horizon` (text)
      - `model_version` (text, default 'v1.0')
      - `features_used` (jsonb)
      - `actual_value` (numeric, nullable)
      - `accuracy_score` (numeric, nullable)
      - `created_at` (timestamptz)
      - `target_date` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can only access their own alerts
    - Public read access to predictions

  3. Indexes
    - Performance indexes for user queries
*/

-- Create enums
CREATE TYPE alert_type AS ENUM ('price', 'volume', 'trend', 'volatility');
CREATE TYPE condition_type AS ENUM ('above', 'below', 'crosses_above', 'crosses_below');
CREATE TYPE severity_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE prediction_type AS ENUM ('price', 'trend', 'volatility');

-- Create user_alerts table
CREATE TABLE IF NOT EXISTS user_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  symbol_id uuid NOT NULL REFERENCES market_symbols(id) ON DELETE CASCADE,
  alert_type alert_type NOT NULL,
  condition_type condition_type NOT NULL,
  target_value numeric NOT NULL,
  current_value numeric,
  is_triggered boolean DEFAULT false,
  is_active boolean DEFAULT true,
  message text,
  severity severity_level DEFAULT 'medium',
  triggered_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create ai_predictions table
CREATE TABLE IF NOT EXISTS ai_predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol_id uuid NOT NULL REFERENCES market_symbols(id) ON DELETE CASCADE,
  prediction_type prediction_type NOT NULL,
  predicted_value numeric NOT NULL,
  confidence_score numeric NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  time_horizon text NOT NULL,
  model_version text DEFAULT 'v1.0',
  features_used jsonb DEFAULT '{}',
  actual_value numeric,
  accuracy_score numeric CHECK (accuracy_score >= 0 AND accuracy_score <= 1),
  created_at timestamptz DEFAULT now(),
  target_date timestamptz NOT NULL
);

-- Enable RLS
ALTER TABLE user_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_predictions ENABLE ROW LEVEL SECURITY;

-- User alerts policies
CREATE POLICY "Users can read own alerts"
  ON user_alerts
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own alerts"
  ON user_alerts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts"
  ON user_alerts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own alerts"
  ON user_alerts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role policies for alerts
CREATE POLICY "Service role can update alerts"
  ON user_alerts
  FOR UPDATE
  TO service_role
  USING (true);

-- AI predictions policies
CREATE POLICY "Public read access to predictions"
  ON ai_predictions
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Service role can manage predictions"
  ON ai_predictions
  FOR ALL
  TO service_role
  USING (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_alerts_user_id 
  ON user_alerts(user_id);

CREATE INDEX IF NOT EXISTS idx_user_alerts_symbol_id 
  ON user_alerts(symbol_id);

CREATE INDEX IF NOT EXISTS idx_user_alerts_active_triggered 
  ON user_alerts(is_active, is_triggered);

CREATE INDEX IF NOT EXISTS idx_ai_predictions_symbol_target_date 
  ON ai_predictions(symbol_id, target_date);

CREATE INDEX IF NOT EXISTS idx_ai_predictions_type_date 
  ON ai_predictions(prediction_type, target_date);