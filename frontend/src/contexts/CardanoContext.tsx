import React, { createContext, useContext, ReactNode } from 'react';
import { useCardano } from '../hooks/useCardano';

interface CardanoWallet {
  name: string;
  api: any;
  address: string;
  balance: string;
}

interface CardanoContextType {
  availableWallets: string[];
  selectedWallet: string;
  wallet: CardanoWallet | null;
  loading: boolean;
  error: string;
  connectWallet: (walletName: string) => Promise<void>;
  disconnectWallet: () => void;
  sendADA: (recipient: string, amount: string) => Promise<string>;
  createNoteWithMetadata: (noteId: number, noteHash: string) => Promise<string>;
}

const CardanoContext = createContext<CardanoContextType | undefined>(undefined);

export const useCardanoContext = () => {
  const context = useContext(CardanoContext);
  if (!context) {
    throw new Error('useCardanoContext must be used within CardanoProvider');
  }
  return context;
};

interface CardanoProviderProps {
  children: ReactNode;
}

export const CardanoProvider: React.FC<CardanoProviderProps> = ({ children }) => {
  const cardanoHook = useCardano();

  return (
    <CardanoContext.Provider value={cardanoHook}>
      {children}
    </CardanoContext.Provider>
  );
};