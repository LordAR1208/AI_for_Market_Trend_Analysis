import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MarketData, Alert, AnalysisResult } from '../types';
import { dataService } from '../services/dataService';
import MarketOverview from './MarketOverview';
import TrendChart from './TrendChart';
import PredictionPanel from './PredictionPanel';
import AlertsPanel from './AlertsPanel';
import TechnicalAnalysis from './TechnicalAnalysis';
import Header from './Header';

const Dashboard: React.FC = () => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('AAPL');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize data
    const initializeData = async () => {
      setIsLoading(true);
      
      const initialMarketData = dataService.generateMockMarketData();
      const initialAlerts = dataService.generateAlerts();
      const analysis = dataService.performTechnicalAnalysis(selectedSymbol);
      
      setMarketData(initialMarketData);
      setAlerts(initialAlerts);
      setAnalysisResult(analysis);
      setIsLoading(false);
    };

    initializeData();

    // Start real-time updates
    dataService.startRealTimeUpdates((newData) => {
      setMarketData(newData);
    });

    return () => {
      dataService.stopRealTimeUpdates();
    };
  }, []);

  useEffect(() => {
    // Update analysis when symbol changes
    const analysis = dataService.performTechnicalAnalysis(selectedSymbol);
    setAnalysisResult(analysis);
  }, [selectedSymbol]);

  const handleSymbolSelect = (symbol: string) => {
    setSelectedSymbol(symbol);
  };

  const handleAlertDismiss = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white text-xl"
        >
          Loading Market Data...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      
      <main className="container mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8"
        >
          {/* Market Overview */}
          <section>
            <h2 className="text-2xl font-bold mb-6">Market Overview</h2>
            <MarketOverview 
              data={marketData} 
              onSymbolSelect={handleSymbolSelect}
              selectedSymbol={selectedSymbol}
            />
          </section>

          {/* Main Analysis Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart and Predictions */}
            <div className="lg:col-span-2 space-y-8">
              <TrendChart symbol={selectedSymbol} />
              <PredictionPanel symbol={selectedSymbol} />
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              <AlertsPanel 
                alerts={alerts} 
                onDismiss={handleAlertDismiss} 
              />
              {analysisResult && (
                <TechnicalAnalysis analysis={analysisResult} />
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;