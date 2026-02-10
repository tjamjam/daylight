import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface TrustContextType {
  photosProcessed: number;
  incrementPhotosProcessed: () => void;
}

const TrustContext = createContext<TrustContextType | undefined>(undefined);

export function TrustProvider({ children }: { children: ReactNode }) {
  const [photosProcessed, setPhotosProcessed] = useState(0);

  const incrementPhotosProcessed = () => {
    setPhotosProcessed(prev => prev + 1);
  };

  return (
    <TrustContext.Provider value={{ photosProcessed, incrementPhotosProcessed }}>
      {children}
    </TrustContext.Provider>
  );
}

export function useTrust() {
  const context = useContext(TrustContext);
  if (context === undefined) {
    throw new Error('useTrust must be used within a TrustProvider');
  }
  return context;
}
