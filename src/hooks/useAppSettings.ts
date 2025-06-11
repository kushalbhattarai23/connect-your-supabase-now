
import { useState, useEffect } from 'react';

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

  const toggleApp = (app: 'tvShows' | 'finance') => {
    updateSettings({
      enabledApps: {
        ...settings.enabledApps,
        [app]: !settings.enabledApps[app]
      }
    });
  };

  return {
    settings,
    updateSettings,
    toggleApp
  };
};
