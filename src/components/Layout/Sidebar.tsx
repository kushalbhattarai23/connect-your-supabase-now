
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
  X,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  User,
  Target,
  CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';
import { OrganizationSwitcher } from '@/components/OrganizationSwitcher';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
  X,
  User,
  Target,
  CreditCard
};

interface SidebarContentProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({ isCollapsed = false, onToggleCollapse }) => {
  const location = useLocation();
  const { settings } = useAppSettings();
  const { user } = useAuth();
  const enabledApps = getEnabledApps(settings);
  
  // State for accordion sections
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    'tv-shows': true,
    'finance': true
  });

  const toggleSection = (sectionId: string) => {
    if (isCollapsed) return; // Don't toggle when collapsed
    setOpenSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const getIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName as keyof typeof iconMap];
    return IconComponent || Home;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 lg:p-6">
        <div className="flex items-center justify-between">
          <Link to="/" className={cn("flex items-center space-x-2", isCollapsed && "lg:justify-center")}>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold">T</span>
            </div>
            {!isCollapsed && (
              <span className="font-semibold text-lg">TrackerHub</span>
            )}
          </Link>
          
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleCollapse}
              className="hidden lg:flex h-8 w-8 p-0"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      <nav className="flex-1 px-3 lg:px-4 space-y-2 overflow-y-auto">
        <Link
          to="/"
          className={cn(
            "flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors",
            location.pathname === "/" 
              ? "bg-accent text-accent-foreground" 
              : "text-muted-foreground hover:text-foreground hover:bg-accent",
            isCollapsed && "lg:justify-center lg:space-x-0"
          )}
          title={isCollapsed ? "Home" : undefined}
        >
          <Home className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span>Home</span>}
        </Link>

        {enabledApps.map((app) => (
          <Collapsible 
            key={app.id} 
            open={isCollapsed ? true : openSections[app.id]}
            onOpenChange={() => toggleSection(app.id)}
          >
            <div className="space-y-1">
              <CollapsibleTrigger asChild>
                <button 
                  className={cn(
                    "w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors",
                    isCollapsed && "lg:justify-center lg:space-x-0"
                  )}
                  disabled={isCollapsed}
                >
                  {React.createElement(getIcon(app.icon), { 
                    className: `w-5 h-5 text-${app.color}-500 flex-shrink-0` 
                  })}
                  {!isCollapsed && (
                    <>
                      <span className="font-medium text-sm flex-1 text-left">{app.name}</span>
                      {openSections[app.id] ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </>
                  )}
                </button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-1">
                {/* Organization Switcher for Finance section */}
                {app.id === 'finance' && user && !isCollapsed && (
                  <div className="px-3 pb-2">
                    <OrganizationSwitcher />
                  </div>
                )}

                {app.routes
                  .filter(route => route.path !== '/tv-shows/show/:slug')
                  .map((route) => {
                    const Icon = getIcon(route.icon || 'Home');
                    
                    // Show TV Shows routes to everyone, but finance routes only to authenticated users
                    if (app.id === 'finance' && !user) {
                      return null;
                    }
                    
                    return (
                      <Link
                        key={route.path}
                        to={route.path}
                        title={isCollapsed ? route.name : undefined}
                        className={cn(
                          "flex items-center space-x-3 px-3 lg:px-6 py-2 rounded-lg transition-colors text-sm",
                          location.pathname === route.path
                            ? `bg-${app.color}-100 text-${app.color}-700 dark:bg-${app.color}-900 dark:text-${app.color}-300`
                            : "text-muted-foreground hover:text-foreground hover:bg-accent",
                          isCollapsed && "lg:justify-center lg:space-x-0 lg:px-3"
                        )}
                      >
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        {!isCollapsed && <span>{route.name}</span>}
                      </Link>
                    );
                  })}

                {/* Add special routes for TV Shows - available to everyone */}
                {app.id === 'tv-shows' && (
                  <>
                    <Link
                      to="/tv-shows/public-universes"
                      title={isCollapsed ? "Public Universes" : undefined}
                      className={cn(
                        "flex items-center space-x-3 px-3 lg:px-6 py-2 rounded-lg transition-colors text-sm",
                        location.pathname === '/tv-shows/public-universes'
                          ? `bg-${app.color}-100 text-${app.color}-700 dark:bg-${app.color}-900 dark:text-${app.color}-300`
                          : "text-muted-foreground hover:text-foreground hover:bg-accent",
                        isCollapsed && "lg:justify-center lg:space-x-0 lg:px-3"
                      )}
                    >
                      <Globe className="w-4 h-4 flex-shrink-0" />
                      {!isCollapsed && <span>Public Universes</span>}
                    </Link>
                    
                    {/* Show user-specific TV shows routes only to authenticated users */}
                    {user && (
                      <Link
                        to="/tv-shows/universes"
                        title={isCollapsed ? "My Universes" : undefined}
                        className={cn(
                          "flex items-center space-x-3 px-3 lg:px-6 py-2 rounded-lg transition-colors text-sm",
                          location.pathname === '/tv-shows/universes'
                            ? `bg-${app.color}-100 text-${app.color}-700 dark:bg-${app.color}-900 dark:text-${app.color}-300`
                            : "text-muted-foreground hover:text-foreground hover:bg-accent",
                          isCollapsed && "lg:justify-center lg:space-x-0 lg:px-3"
                        )}
                      >
                        <Users className="w-4 h-4 flex-shrink-0" />
                        {!isCollapsed && <span>My Universes</span>}
                      </Link>
                    )}
                  </>
                )}

                {/* Add additional routes for Finance - only for authenticated users */}
                {app.id === 'finance' && user && (
                  <>
                    <Link
                      to="/finance/credits"
                      title={isCollapsed ? "Credits" : undefined}
                      className={cn(
                        "flex items-center space-x-3 px-3 lg:px-6 py-2 rounded-lg transition-colors text-sm",
                        location.pathname === '/finance/credits'
                          ? `bg-${app.color}-100 text-${app.color}-700 dark:bg-${app.color}-900 dark:text-${app.color}-300`
                          : "text-muted-foreground hover:text-foreground hover:bg-accent",
                        isCollapsed && "lg:justify-center lg:space-x-0 lg:px-3"
                      )}
                    >
                      <CreditCard className="w-4 h-4 flex-shrink-0" />
                      {!isCollapsed && <span>Credits</span>}
                    </Link>
                  </>
                )}
              </CollapsibleContent>
            </div>
          </Collapsible>
        ))}
      </nav>

      {/* Show profile and settings only to authenticated users */}
      {user && (
        <div className="p-3 lg:p-4 border-t border-border space-y-1">
          <Link
            to="/profile"
            title={isCollapsed ? "Profile" : undefined}
            className={cn(
              "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
              isCollapsed && "lg:justify-center lg:space-x-0"
            )}
          >
            <User className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span>Profile</span>}
          </Link>
          <Link
            to="/settings"
            title={isCollapsed ? "Settings" : undefined}
            className={cn(
              "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
              isCollapsed && "lg:justify-center lg:space-x-0"
            )}
          >
            <SettingsIcon className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span>Settings</span>}
          </Link>
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  return (
    <>
      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed top-4 left-4 z-50 lg:hidden"
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
      <div className={cn(
        "hidden lg:flex bg-card border-r border-border h-full flex-col transition-all duration-300",
        isDesktopCollapsed ? "w-16" : "w-64"
      )}>
        <SidebarContent 
          isCollapsed={isDesktopCollapsed} 
          onToggleCollapse={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
        />
      </div>
    </>
  );
};
