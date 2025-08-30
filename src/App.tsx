import React from 'react';
import { AuthProvider } from './hooks/useAuth';
import ErrorBoundary from './components/ErrorBoundary';
import Dashboard from './components/Dashboard';
import './index.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Dashboard />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;