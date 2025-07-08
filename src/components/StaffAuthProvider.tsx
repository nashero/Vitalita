import React from 'react';
import { StaffAuthContext, useStaffAuthProvider } from '../hooks/useStaffAuth';

interface StaffAuthProviderProps {
  children: React.ReactNode;
}

export default function StaffAuthProvider({ children }: StaffAuthProviderProps) {
  const auth = useStaffAuthProvider();

  return (
    <StaffAuthContext.Provider value={auth}>
      {children}
    </StaffAuthContext.Provider>
  );
}