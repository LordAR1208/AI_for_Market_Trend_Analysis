import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

interface MarketDataUpdate {
  symbol: string;
  price: number;
  volume: number;
  change24h: number;
  changePercent24h: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    if (req.method === 'POST') {
      const { updates }: { updates: MarketDataUpdate[] } = await req.json()

      // Process each market data update
      for (const update of updates) {
        // Get symbol ID
        const { data: symbolData, error: symbolError } = await supabaseClient
          .from('market_symbols')
          .select('id')
          .eq('symbol', update.symbol)
          .single()

        if (symbolError) {
          console.error(`Symbol not found: ${update.symbol}`)
          continue
        }

        // Insert new market data
        const { error: insertError } = await supabaseClient
          .from('market_data')
          .insert({
            symbol_id: symbolData.id,
            price: update.price,
            volume: update.volume,
            change_24h: update.change24h,
            change_percent_24h: update.changePercent24h,
            timestamp: new Date().toISOString()
          })

        if (insertError) {
          console.error(`Error inserting market data for ${update.symbol}:`, insertError)
        }

        // Calculate and store technical indicators
        await calculateTechnicalIndicators(supabaseClient, symbolData.id)
      }

      return new Response(
        JSON.stringify({ success: true, processed: updates.length }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    if (req.method === 'GET') {
      // Fetch latest market data
      const { data, error } = await supabaseClient
        .from('market_data')
        .select(`
          *,
          market_symbols!inner(symbol, name, type)
        `)
        .order('timestamp', { ascending: false })
        .limit(100)

      if (error) throw error

      return new Response(
        JSON.stringify(data),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

async function calculateTechnicalIndicators(supabaseClient: any, symbolId: string) {
  try {
    // Get recent historical data for calculations
    const { data: historicalData, error } = await supabaseClient
      .from('historical_data')
      .select('close_price, volume, date')
      .eq('symbol_id', symbolId)
      .order('date', { ascending: false })
      .limit(200)

    if (error || !historicalData || historicalData.length < 20) {
      return
    }

    const prices = historicalData.map(d => parseFloat(d.close_price)).reverse()
    const volumes = historicalData.map(d => parseInt(d.volume)).reverse()

    // Calculate technical indicators
    const rsi = calculateRSI(prices, 14)
    const { macd, signal } = calculateMACD(prices)
    const ma20 = calculateSMA(prices, 20)
    const ma50 = calculateSMA(prices, 50)
    const ma200 = calculateSMA(prices, 200)
    const { upper, lower } = calculateBollingerBands(prices, 20, 2)

    // Store technical indicators
    await supabaseClient
      .from('technical_indicators')
      .insert({
        symbol_id: symbolId,
        rsi: rsi[rsi.length - 1],
        macd: macd[macd.length - 1],
        macd_signal: signal[signal.length - 1],
        ma_20: ma20[ma20.length - 1],
        ma_50: ma50[ma50.length - 1],
        ma_200: ma200[ma200.length - 1],
        bollinger_upper: upper[upper.length - 1],
        bollinger_lower: lower[lower.length - 1],
        timestamp: new Date().toISOString()
      })
  } catch (error) {
    console.error('Error calculating technical indicators:', error)
  }
}

function calculateRSI(prices: number[], period: number = 14): number[] {
  const rsi: number[] = []
  
  for (let i = period; i < prices.length; i++) {
    let gains = 0
    let losses = 0
    
    for (let j = i - period + 1; j <= i; j++) {
      const change = prices[j] - prices[j - 1]
      if (change > 0) gains += change
      else losses -= change
    }
    
    const avgGain = gains / period
    const avgLoss = losses / period
    const rs = avgGain / avgLoss
    rsi.push(100 - (100 / (1 + rs)))
  }
  
  return rsi
}

function calculateMACD(prices: number[], fast: number = 12, slow: number = 26, signal: number = 9): { macd: number[], signal: number[] } {
  const ema12 = calculateEMA(prices, fast)
  const ema26 = calculateEMA(prices, slow)
  
  const macd: number[] = []
  for (let i = 0; i < Math.min(ema12.length, ema26.length); i++) {
    macd.push(ema12[i] - ema26[i])
  }
  
  const signalLine = calculateEMA(macd, signal)
  
  return { macd, signal: signalLine }
}

function calculateSMA(prices: number[], period: number): number[] {
  const sma: number[] = []
  
  for (let i = period - 1; i < prices.length; i++) {
    const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
    sma.push(sum / period)
  }
  
  return sma
}

function calculateEMA(prices: number[], period: number): number[] {
  const ema: number[] = []
  const multiplier = 2 / (period + 1)
  
  ema[0] = prices[0]
  
  for (let i = 1; i < prices.length; i++) {
    ema[i] = (prices[i] * multiplier) + (ema[i - 1] * (1 - multiplier))
  }
  
  return ema
}

function calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2): { upper: number[], lower: number[] } {
  const sma = calculateSMA(prices, period)
  const upper: number[] = []
  const lower: number[] = []
  
  for (let i = period - 1; i < prices.length; i++) {
    const slice = prices.slice(i - period + 1, i + 1)
    const mean = slice.reduce((a, b) => a + b, 0) / period
    const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period
    const standardDeviation = Math.sqrt(variance)
    
    const smaIndex = i - period + 1
    upper.push(sma[smaIndex] + (standardDeviation * stdDev))
    lower.push(sma[smaIndex] - (standardDeviation * stdDev))
  }
  
  return { upper, lower }
}</parameter>