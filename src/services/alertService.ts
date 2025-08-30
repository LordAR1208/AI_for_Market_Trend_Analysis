import { supabase, handleSupabaseError } from '../lib/supabase';
import { Alert } from '../types';

export interface CreateAlertData {
  symbolId: string;
  alertType: 'price' | 'volume' | 'trend' | 'volatility';
  conditionType: 'above' | 'below' | 'crosses_above' | 'crosses_below';
  targetValue: number;
  severity?: 'low' | 'medium' | 'high';
}

export interface UserAlert {
  id: string;
  symbolId: string;
  symbol: string;
  alertType: 'price' | 'volume' | 'trend' | 'volatility';
  conditionType: 'above' | 'below' | 'crosses_above' | 'crosses_below';
  targetValue: number;
  currentValue?: number;
  isTriggered: boolean;
  isActive: boolean;
  message?: string;
  severity: 'low' | 'medium' | 'high';
  triggeredAt?: string;
  createdAt: string;
}

class AlertService {
  async createAlert(userId: string, alertData: CreateAlertData): Promise<UserAlert> {
    try {
      const { data, error } = await supabase
        .from('user_alerts')
        .insert({
          user_id: userId,
          symbol_id: alertData.symbolId,
          alert_type: alertData.alertType,
          condition_type: alertData.conditionType,
          target_value: alertData.targetValue,
          severity: alertData.severity || 'medium',
          message: this.generateAlertMessage(alertData)
        })
        .select(`
          *,
          market_symbols!inner(symbol, name)
        `)
        .single();

      if (error) throw error;

      return this.mapToUserAlert(data);
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  async getUserAlerts(userId: string): Promise<UserAlert[]> {
    try {
      const { data, error } = await supabase
        .from('user_alerts')
        .select(`
          *,
          market_symbols!inner(symbol, name)
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(this.mapToUserAlert);
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  async updateAlert(alertId: string, updates: Partial<CreateAlertData>): Promise<UserAlert> {
    try {
      const { data, error } = await supabase
        .from('user_alerts')
        .update({
          ...updates,
          target_value: updates.targetValue
        })
        .eq('id', alertId)
        .select(`
          *,
          market_symbols!inner(symbol, name)
        `)
        .single();

      if (error) throw error;

      return this.mapToUserAlert(data);
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  async deleteAlert(alertId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_alerts')
        .update({ is_active: false })
        .eq('id', alertId);

      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  async triggerAlert(alertId: string, currentValue: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_alerts')
        .update({
          is_triggered: true,
          current_value: currentValue,
          triggered_at: new Date().toISOString()
        })
        .eq('id', alertId);

      if (error) throw error;
    } catch (error) {
      handleSupabaseError(error);
      throw error;
    }
  }

  async checkAndTriggerAlerts(): Promise<void> {
    try {
      // Get all active alerts
      const { data: alerts, error: alertsError } = await supabase
        .from('user_alerts')
        .select(`
          *,
          market_symbols!inner(symbol),
          market_data!inner(price)
        `)
        .eq('is_active', true)
        .eq('is_triggered', false);

      if (alertsError) throw alertsError;

      // Check each alert against current market data
      for (const alert of alerts) {
        const currentPrice = parseFloat(alert.market_data.price);
        const targetValue = parseFloat(alert.target_value);
        let shouldTrigger = false;

        switch (alert.condition_type) {
          case 'above':
            shouldTrigger = currentPrice > targetValue;
            break;
          case 'below':
            shouldTrigger = currentPrice < targetValue;
            break;
          case 'crosses_above':
            // This would require historical comparison
            shouldTrigger = currentPrice > targetValue;
            break;
          case 'crosses_below':
            // This would require historical comparison
            shouldTrigger = currentPrice < targetValue;
            break;
        }

        if (shouldTrigger) {
          await this.triggerAlert(alert.id, currentPrice);
        }
      }
    } catch (error) {
      console.error('Error checking alerts:', error);
    }
  }

  // Convert database alerts to frontend format
  async getAlertsForFrontend(userId: string): Promise<Alert[]> {
    try {
      const userAlerts = await this.getUserAlerts(userId);
      
      return userAlerts.map(alert => ({
        id: alert.id,
        symbol: alert.symbol,
        type: alert.alertType,
        severity: alert.severity,
        message: alert.message || this.generateAlertMessage({
          symbolId: alert.symbolId,
          alertType: alert.alertType,
          conditionType: alert.conditionType,
          targetValue: alert.targetValue
        }),
        timestamp: alert.createdAt,
        isRead: alert.isTriggered
      }));
    } catch (error) {
      console.error('Error getting alerts for frontend:', error);
      return [];
    }
  }

  private mapToUserAlert(data: any): UserAlert {
    return {
      id: data.id,
      symbolId: data.symbol_id,
      symbol: data.market_symbols.symbol,
      alertType: data.alert_type,
      conditionType: data.condition_type,
      targetValue: parseFloat(data.target_value),
      currentValue: data.current_value ? parseFloat(data.current_value) : undefined,
      isTriggered: data.is_triggered,
      isActive: data.is_active,
      message: data.message,
      severity: data.severity,
      triggeredAt: data.triggered_at,
      createdAt: data.created_at
    };
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

export const alertService = new AlertService();