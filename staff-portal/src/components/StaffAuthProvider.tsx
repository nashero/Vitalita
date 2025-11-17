import { ReactNode } from 'react';
import { StaffAuthContext, useStaffAuthProvider } from '../hooks/useStaffAuth';

interface StaffAuthProviderProps {
  children: ReactNode;
}

export function StaffAuthProvider({ children }: StaffAuthProviderProps) {
  const auth = useStaffAuthProvider();

  return (
    <StaffAuthContext.Provider value={auth}>
      {children}
    </StaffAuthContext.Provider>
  );
}

