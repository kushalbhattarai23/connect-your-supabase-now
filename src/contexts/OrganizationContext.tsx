
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Organization } from '@/hooks/useOrganizations';

interface OrganizationContextType {
  currentOrganization: Organization | null;
  setCurrentOrganization: (org: Organization | null) => void;
  isPersonalMode: boolean;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);

  // Load saved organization from localStorage on mount
  useEffect(() => {
    const savedOrgId = localStorage.getItem('currentOrganizationId');
    if (savedOrgId && savedOrgId !== 'personal') {
      // This will be populated when organizations are loaded
      const savedOrg = localStorage.getItem('currentOrganization');
      if (savedOrg) {
        try {
          setCurrentOrganization(JSON.parse(savedOrg));
        } catch (error) {
          console.error('Error parsing saved organization:', error);
          localStorage.removeItem('currentOrganization');
          localStorage.removeItem('currentOrganizationId');
        }
      }
    }
  }, []);

  // Save current organization to localStorage when it changes
  useEffect(() => {
    if (currentOrganization) {
      localStorage.setItem('currentOrganizationId', currentOrganization.id);
      localStorage.setItem('currentOrganization', JSON.stringify(currentOrganization));
    } else {
      localStorage.setItem('currentOrganizationId', 'personal');
      localStorage.removeItem('currentOrganization');
    }
  }, [currentOrganization]);

  const isPersonalMode = currentOrganization === null;

  return (
    <OrganizationContext.Provider 
      value={{ 
        currentOrganization, 
        setCurrentOrganization, 
        isPersonalMode 
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganizationContext = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganizationContext must be used within an OrganizationProvider');
  }
  return context;
};
