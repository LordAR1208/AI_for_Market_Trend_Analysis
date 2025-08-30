import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Bell, Settings, User, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 border-b border-gray-700"
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-blue-400" />
              <h1 className="text-2xl font-bold">MarketFlow AI</h1>
            </div>
            <div className="hidden md:flex items-center space-x-1 bg-green-900/20 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-sm">Live Data</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {user && (
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-300">
                <span>Welcome, {user.fullName || user.email}</span>
                <span className={`px-2 py-1 rounded text-xs ${
                  user.subscriptionTier === 'enterprise' ? 'bg-purple-600' :
                  user.subscriptionTier === 'premium' ? 'bg-blue-600' : 'bg-gray-600'
                }`}>
                  {user.subscriptionTier.toUpperCase()}
                </span>
              </div>
            )}
            <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </button>
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Settings className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <User className="h-5 w-5" />
            </button>
            {user && (
              <button 
                onClick={handleSignOut}
                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                title="Sign Out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;