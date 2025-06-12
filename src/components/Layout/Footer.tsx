
import React from 'react';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { getEnabledApps } from '@/config/apps';
import { useAppSettings } from '@/hooks/useAppSettings';

export const Footer: React.FC = () => {
  const { settings } = useAppSettings();
  const enabledApps = getEnabledApps(settings);

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold">T</span>
              </div>
              <span className="font-semibold text-lg">TrackerHub</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your personal tracking and management platform for shows, finances, and more.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-4">
            <h3 className="font-semibold">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-muted-foreground hover:text-foreground transition-colors">
                  Profile
                </Link>
              </li>
              <li>
                <Link to="/settings" className="text-muted-foreground hover:text-foreground transition-colors">
                  Settings
                </Link>
              </li>
            </ul>
          </div>

          {/* Apps */}
          <div className="space-y-4">
            <h3 className="font-semibold">Applications</h3>
            <ul className="space-y-2 text-sm">
              {enabledApps.map((app) => (
                <li key={app.id}>
                  <Link 
                    to={app.routes[0]?.path || '#'} 
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {app.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Features */}
          <div className="space-y-4">
            <h3 className="font-semibold">Features</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/tv-shows/universes" className="text-muted-foreground hover:text-foreground transition-colors">
                  TV Show Universes
                </Link>
              </li>
              <li>
                <Link to="/finance/wallets" className="text-muted-foreground hover:text-foreground transition-colors">
                  Wallets
                </Link>
              </li>
              <li>
                <Link to="/finance/loans" className="text-muted-foreground hover:text-foreground transition-colors">
                  Loans
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-6" />
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 TrackerHub. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm">
            <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
