
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

export interface AppSettings {
  enabledApps: {
    tvShows: boolean;
    finance: boolean;
  };
}

const defaultSettings: AppSettings = {
  enabledApps: {
    tvShows: true,
    finance: true,
  }
};

export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const { logout } = useAuth();

  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Failed to parse app settings:', error);
      }
    }
  }, []);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('appSettings', JSON.stringify(updatedSettings));
  };

  const toggleApp = async (app: 'tvShows' | 'finance') => {
    updateSettings({
      enabledApps: {
        ...settings.enabledApps,
        [app]: !settings.enabledApps[app]
      }
    });
    
    // Log out user when app preferences change
    await logout();
  };

  return {
    settings,
    updateSettings,
    toggleApp
  };
};
