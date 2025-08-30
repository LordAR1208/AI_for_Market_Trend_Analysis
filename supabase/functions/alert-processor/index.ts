import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
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
      // Process alert checks
      await processAlerts(supabaseClient)

      return new Response(
        JSON.stringify({ success: true, message: 'Alerts processed' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }

    if (req.method === 'GET') {
      // Get triggered alerts for a user
      const url = new URL(req.url)
      const userId = url.searchParams.get('user_id')

      if (!userId) {
        throw new Error('User ID is required')
      }

      const { data, error } = await supabaseClient
        .from('user_alerts')
        .select(`
          *,
          market_symbols!inner(symbol, name)
        `)
        .eq('user_id', userId)
        .eq('is_triggered', true)
        .eq('is_active', true)
        .order('triggered_at', { ascending: false })

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

async function processAlerts(supabaseClient: any) {
  try {
    // Get all active, non-triggered alerts with current market data
    const { data: alerts, error } = await supabaseClient
      .from('user_alerts')
      .select(`
        *,
        market_symbols!inner(symbol),
        market_data!inner(price, timestamp)
      `)
      .eq('is_active', true)
      .eq('is_triggered', false)

    if (error) throw error

    for (const alert of alerts) {
      const currentPrice = parseFloat(alert.market_data.price)
      const targetValue = parseFloat(alert.target_value)
      let shouldTrigger = false

      // Check alert conditions
      switch (alert.condition_type) {
        case 'above':
          shouldTrigger = currentPrice > targetValue
          break
        case 'below':
          shouldTrigger = currentPrice < targetValue
          break
        case 'crosses_above':
          // For crosses, we'd need to check previous values
          shouldTrigger = currentPrice > targetValue
          break
        case 'crosses_below':
          shouldTrigger = currentPrice < targetValue
          break
      }

      if (shouldTrigger) {
        // Trigger the alert
        await supabaseClient
          .from('user_alerts')
          .update({
            is_triggered: true,
            current_value: currentPrice,
            triggered_at: new Date().toISOString()
          })
          .eq('id', alert.id)

        // Here you could also send notifications (email, push, etc.)
        console.log(`Alert triggered for ${alert.market_symbols.symbol}: ${alert.message}`)
      }
    }
  } catch (error) {
    console.error('Error processing alerts:', error)
  }
}</parameter>