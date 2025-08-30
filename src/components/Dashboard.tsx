import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogIn, TrendingUp, Brain, Target } from 'lucide-react';
import { MarketData, Alert, AnalysisResult } from '../types';
import { dataService } from '../services/dataService';
import { useAuth } from '../hooks/useAuth.tsx';
import MarketOverview from './MarketOverview';
import TrendChart from './TrendChart';
import EnhancedPredictionChart from './EnhancedPredictionChart';
import ValidationDashboard from './ValidationDashboard';
import RealTimeValidator from './RealTimeValidator';
import AlertsPanel from './AlertsPanel';
import TechnicalAnalysis from './TechnicalAnalysis';
import Header from './Header';
import AuthModal from './AuthModal';

const Dashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>('AAPL');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'predictions' | 'validation'>('overview');

  useEffect(() => {
    // Initialize data
    const initializeData = async () => {
      setIsLoading(true);
      
      try {
        const initialMarketData = await dataService.getLatestMarketData();
        const initialAlerts = user ? await dataService.getUserAlertsPublic() : dataService.generateAlerts();
        const analysis = await dataService.getRealAnalysisPublic(selectedSymbol);
      
        setMarketData(initialMarketData);
        setAlerts(Array.isArray(initialAlerts) ? initialAlerts : dataService.generateAlerts());
        setAnalysisResult(analysis);
      } catch (error) {
        console.error('Error initializing data:', error);
        // Fallback to mock data
        const initialMarketData = dataService.generateMockMarketData();
        const initialAlerts = dataService.generateAlerts();
        const analysis = dataService.performTechnicalAnalysisPublic(selectedSymbol);
        
        setMarketData(initialMarketData);
        setAlerts(initialAlerts);
        setAnalysisResult(analysis);
      }
      setIsLoading(false);
    };

    initializeData();

    // Start real-time updates
    dataService.startRealTimeUpdates(async (newData) => {
      setMarketData(newData);
      
      // Update alerts if user is authenticated
      if (user) {
        try {
          const updatedAlerts = await dataService.getUserAlertsPublic();
          setAlerts(Array.isArray(updatedAlerts) ? updatedAlerts : []);
        } catch (error) {
          console.error('Error updating alerts:', error);
        }
      }
    });

    return () => {
      dataService.stopRealTimeUpdates();
    };
  }, [user]);

  useEffect(() => {
    // Update analysis when symbol changes
    const updateAnalysis = async () => {
      try {
        const analysis = await dataService.getRealAnalysisPublic(selectedSymbol);
        setAnalysisResult(analysis);
      } catch (error) {
        console.error('Error updating analysis:', error);
        const analysis = dataService.performTechnicalAnalysisPublic(selectedSymbol);
        setAnalysisResult(analysis);
      }
    };
    
    updateAnalysis();
  }, [selectedSymbol]);

  const handleSymbolSelect = (symbol: string) => {
    setSelectedSymbol(symbol);
  };

  const handleAlertDismiss = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  if (authLoading || isLoading) {
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
      
      {/* Authentication prompt for non-authenticated users */}
      {!user && (
        <div className="bg-blue-600/10 border-b border-blue-600/20">
          <div className="container mx-auto px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <LogIn className="h-5 w-5 text-blue-400" />
                <span className="text-blue-400">
                  Sign in to access personalized alerts, portfolios, and advanced features
                </span>
              </div>
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      )}
      
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
          {/* Navigation Tabs */}
          <div className="flex space-x-1 bg-gray-800 rounded-lg p-1 mb-8">
            {[
              { id: 'overview', label: 'Market Overview', icon: TrendingUp },
              { id: 'predictions', label: 'AI Predictions', icon: Brain },
              { id: 'validation', label: 'Model Validation', icon: Target }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  activeTab === id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <TrendChart symbol={selectedSymbol} />
              </div>
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
          )}

          {activeTab === 'predictions' && (
            <div className="space-y-8">
              <EnhancedPredictionChart symbol={selectedSymbol} />
              <RealTimeValidator symbols={[selectedSymbol]} />
            </div>
          )}

          {activeTab === 'validation' && (
            <ValidationDashboard symbols={marketData.map(d => d.symbol)} />
          )}
        </motion.div>
      </main>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
};
            </div>
          </div>
        </motion.div>
      </main>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  );
};

export default Dashboard;
export default Dashboard;