import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface ErrorContextType {
  showNetworkError: () => void;
  showServerError: () => void;
  clearError: () => void;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentError, setCurrentError] = useState<'network' | 'server' | null>(null);

  const showNetworkError = useCallback(() => {
    setCurrentError('network');
    navigate('/error/network', { state: { from: location.pathname } });
  }, [navigate, location.pathname]);

  const showServerError = useCallback(() => {
    setCurrentError('server');
    navigate('/error/server', { state: { from: location.pathname } });
  }, [navigate, location.pathname]);

  const clearError = useCallback(() => {
    setCurrentError(null);
  }, []);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => {
      if (currentError === 'network') {
        clearError();
        window.location.reload();
      }
    };

    const handleOffline = () => {
      if (location.pathname !== '/error/network' && location.pathname !== '/') {
        showNetworkError();
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentError, clearError, showNetworkError, location.pathname]);

  return (
    <ErrorContext.Provider value={{ showNetworkError, showServerError, clearError }}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = () => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};
