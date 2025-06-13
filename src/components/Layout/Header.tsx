
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { LogOut, User } from 'lucide-react';
import { OrganizationSwitcher } from '@/components/OrganizationSwitcher';
import { useOrganizationContext } from '@/contexts/OrganizationContext';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { isPersonalMode, currentOrganization } = useOrganizationContext();

  if (!user) return null;

  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase();
  };

  return (
    <header className="border-b border-border bg-background px-4 lg:px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-muted-foreground">
            {isPersonalMode ? (
              <span className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>Personal Finance</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1">
                <span className="font-medium">{currentOrganization?.name}</span>
                <span>Finance</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <OrganizationSwitcher />
          
          <div className="flex items-center space-x-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-primary text-primary-foreground">
                {getInitials(user.email)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium hidden sm:inline">{user.email}</span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
};
