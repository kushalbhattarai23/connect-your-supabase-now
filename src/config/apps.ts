
import { AppModule } from '@/types';
import { Tv, DollarSign } from 'lucide-react';

// Import app components
import TVShowDashboard from '@/apps/tv-shows/pages/Dashboard';
import TVShowMyShows from '@/apps/tv-shows/pages/MyShows';
import TVShowPublicShows from '@/apps/tv-shows/pages/PublicShows';
import TVShowPublicUniverses from '@/apps/tv-shows/pages/PublicUniverses';
import TVShowPrivateUniverses from '@/apps/tv-shows/pages/PrivateUniverses';
import TVShowDetail from '@/apps/tv-shows/pages/ShowDetail';

import FinanceDashboard from '@/apps/finance/pages/Dashboard';
import FinanceTransactions from '@/apps/finance/pages/Transactions';
import FinanceWallets from '@/apps/finance/pages/Wallets';
import FinanceTransfers from '@/apps/finance/pages/Transfers';
import FinanceCategories from '@/apps/finance/pages/Categories';
import FinanceReports from '@/apps/finance/pages/Reports';
import FinanceSettings from '@/apps/finance/pages/Settings';
import Loans from '@/apps/finance/pages/Loans';
import Budgets from '@/apps/finance/pages/Budgets';

export const appModules: AppModule[] = [
  {
    id: 'tv-shows',
    name: 'TV Show Tracker',
    slug: 'tv-shows',
    icon: 'Tv',
    color: 'purple',
    description: 'Track your favorite TV shows and episodes',
    enabled: true,
    routes: [
      { path: '/tv-shows', name: 'Dashboard', component: TVShowDashboard, icon: 'BarChart3' },
      { path: '/tv-shows/my-shows', name: 'My Shows', component: TVShowMyShows, icon: 'Heart' },
      { path: '/tv-shows/public-shows', name: 'Public Shows', component: TVShowPublicShows, icon: 'Globe' },
      { path: '/tv-shows/show/:slug', name: 'Show Detail', component: TVShowDetail, icon: 'Tv' },
      { path: '/tv-shows/public-universes', name: 'Public Universes', component: TVShowPublicUniverses, icon: 'Users' },
      { path: '/tv-shows/private-universes', name: 'Private Universes', component: TVShowPrivateUniverses, icon: 'Lock' },
    ]
  },
  {
    id: 'finance',
    name: 'Finance Manager',
    slug: 'finance',
    icon: 'DollarSign',
    color: 'green',
    description: 'Manage your personal finances and track expenses',
    enabled: true,
    routes: [
      { path: '/finance', name: 'Dashboard', component: FinanceDashboard, icon: 'BarChart3' },
      { path: '/finance/transactions', name: 'Transactions', component: FinanceTransactions, icon: 'Receipt' },
      { path: '/finance/wallets', name: 'Wallets', component: FinanceWallets, icon: 'Wallet' },
      { path: '/finance/transfers', name: 'Transfers', component: FinanceTransfers, icon: 'ArrowLeftRight' },
      { path: '/finance/categories', name: 'Categories', component: FinanceCategories, icon: 'Tag' },
      { path: '/finance/loans', name: 'Loans', component: Loans, icon: 'DollarSign' },
      { path: '/finance/budgets', name: 'Budgets', component: Budgets, icon: 'Target' },
      { path: '/finance/reports', name: 'Reports', component: FinanceReports, icon: 'FileBarChart' },
      { path: '/finance/settings', name: 'Settings', component: FinanceSettings, icon: 'Settings' },
    ]
  }
];

export const getEnabledApps = (appSettings?: { enabledApps: { tvShows: boolean; finance: boolean; } }) => {
  if (!appSettings) return appModules.filter(app => app.enabled);
  
  return appModules.filter(app => {
    if (app.id === 'tv-shows') return appSettings.enabledApps.tvShows;
    if (app.id === 'finance') return appSettings.enabledApps.finance;
    return app.enabled;
  });
};
