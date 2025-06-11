
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getEnabledApps } from '@/config/apps';
import { useAppSettings } from '@/hooks/useAppSettings';
import { cn } from '@/lib/utils';
import { 
  Tv, 
  DollarSign, 
  BarChart3, 
  Heart, 
  Globe, 
  Users, 
  Lock, 
  Receipt, 
  Wallet, 
  ArrowLeftRight, 
  Tag, 
  FileBarChart, 
  Settings as SettingsIcon,
  Home,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const iconMap = {
  Tv,
  DollarSign,
  BarChart3,
  Heart,
  Globe,
  Users,
  Lock,
  Receipt,
  Wallet,
  ArrowLeftRight,
  Tag,
  FileBarChart,
  Settings: SettingsIcon,
  Home,
  Menu,
  X
};

const SidebarContent = () => {
  const location = useLocation();
  const { settings } = useAppSettings();
  const enabledApps = getEnabledApps(settings);

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent || Home;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold">M</span>
          </div>
          <span className="font-semibold text-lg">ModularApp</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        <Link
          to="/"
          className={cn(
            "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
            location.pathname === "/" 
              ? "bg-accent text-accent-foreground" 
              : "text-muted-foreground hover:text-foreground hover:bg-accent"
          )}
        >
          <Home className="w-5 h-5" />
          <span>Home</span>
        </Link>

        {enabledApps.map((app) => (
          <div key={app.id} className="space-y-1">
            <div className="px-3 py-2">
              <div className="flex items-center space-x-2">
                {React.createElement(getIcon(app.icon), { 
                  className: `w-4 h-4 text-${app.color}-500` 
                })}
                <span className="font-medium text-sm">{app.name}</span>
              </div>
            </div>
            
            {app.routes
              .filter(route => route.path !== '/tv-shows/show/:slug')
              .map((route) => {
                const Icon = getIcon(route.icon || 'Home');
                return (
                  <Link
                    key={route.path}
                    to={route.path}
                    className={cn(
                      "flex items-center space-x-3 px-6 py-2 rounded-lg transition-colors text-sm",
                      location.pathname === route.path
                        ? `bg-${app.color}-100 text-${app.color}-700 dark:bg-${app.color}-900 dark:text-${app.color}-300`
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{route.name}</span>
                  </Link>
                );
              })}
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <Link
          to="/settings"
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <SettingsIcon className="w-4 h-4" />
          <span>Settings</span>
        </Link>
      </div>
    </div>
  );
};

export const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed top-4 left-4 z-50 md:hidden"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-64 bg-card border-r border-border h-full flex-col">
        <SidebarContent />
      </div>
    </>
  );
};
