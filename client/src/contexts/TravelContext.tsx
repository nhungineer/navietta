import { createContext, useContext, useState, ReactNode } from 'react';
import { useLocation } from 'wouter';
import type { FlightDetails, Preferences } from '@shared/schema';

interface TravelContextType {
  currentStep: number;
  flightDetails: FlightDetails | null;
  setFlightDetails: (details: FlightDetails) => void;
  preferences: Preferences | null;
  setPreferences: (prefs: Preferences) => void;
  sessionId: string | null;
  setSessionId: (id: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  navigateToStep: (step: number) => void;
}

const TravelContext = createContext<TravelContextType | undefined>(undefined);

export function TravelProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const [flightDetails, setFlightDetails] = useState<FlightDetails | null>(null);
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentStep = (): number => {
    switch (location) {
      case '/': return 1;
      case '/flight-details': return 2;
      case '/preferences': return 3;
      case '/results': return 4;
      default: return 1;
    }
  };

  const navigateToStep = (step: number) => {
    const routes = ['/', '/flight-details', '/preferences', '/results'];
    if (step >= 1 && step <= 4) {
      setLocation(routes[step - 1]);
    }
  };

  return (
    <TravelContext.Provider value={{
      currentStep: getCurrentStep(),
      flightDetails,
      setFlightDetails,
      preferences,
      setPreferences,
      sessionId,
      setSessionId,
      isLoading,
      setIsLoading,
      navigateToStep,
    }}>
      {children}
    </TravelContext.Provider>
  );
}

export function useTravelContext() {
  const context = useContext(TravelContext);
  if (context === undefined) {
    throw new Error('useTravelContext must be used within a TravelProvider');
  }
  return context;
}
