import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the shape of a HealthFact
export interface HealthFact {
  title: string;
  description: string;
  category: string;
  source?: string;
}

// Context type
interface FactsContextType {
  healthFacts: HealthFact[] | null;
  setHealthFacts: React.Dispatch<React.SetStateAction<HealthFact[] | null>>;
}

// Create context
const FactsContext = createContext<FactsContextType | undefined>(undefined);

// Provider component
export const FactsProvider = ({ children }: { children: ReactNode }) => {
  const [healthFacts, setHealthFacts] = useState<HealthFact[] | null>(null);

  return (
    <FactsContext.Provider value={{ healthFacts, setHealthFacts }}>
      {children}
    </FactsContext.Provider>
  );
};

// Custom hook
export const useFacts = (): FactsContextType => {
  const context = useContext(FactsContext);
  if (!context) {
    throw new Error('useFacts must be used within a FactsProvider');
  }
  return context;
};
