/**
 * PIN Authentication Provider Component
 * 
 * This component provides PIN authentication context to the application
 * and manages PIN-related state and operations.
 */

import React from 'react';
import { PinAuthContext, usePinAuthProvider } from '../hooks/usePinAuth';

interface PinAuthProviderProps {
  children: React.ReactNode;
}

export default function PinAuthProvider({ children }: PinAuthProviderProps) {
  const pinAuth = usePinAuthProvider();

  return (
    <PinAuthContext.Provider value={pinAuth}>
      {children}
    </PinAuthContext.Provider>
  );
}
