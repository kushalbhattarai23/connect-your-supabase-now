
import { AppModule } from '@/types';
import Landing from '@/pages/Landing';
import { ShowDetail } from '@/apps/tv-shows/pages/ShowDetail';
import { UniverseDetail } from '@/apps/tv-shows/pages/UniverseDetail';

import FinanceTransactions from '@/apps/finance/pages/Transactions';
import AllTransactions from '@/apps/finance/pages/AllTransactions';
import FinanceWallets from '@/apps/finance/pages/Wallets';
import WalletDetail from '@/apps/finance/pages/WalletDetail';
import FinanceCategories from '@/apps/finance/pages/Categories';
import CategoryDetail from '@/apps/finance/pages/CategoryDetail';
import FinanceTransfers from '@/apps/finance/pages/Transfers';
import FinanceDashboard from '@/apps/finance/pages/Dashboard';
import FinanceReports from '@/apps/finance/pages/Reports';
import FinanceSettings from '@/apps/finance/pages/Settings';
import { AppSettings } from '@/hooks/useAppSettings';

export const tvShowsApp: AppModule = {
  id: 'tv-shows',
  name: 'TV Shows',
  slug: 'tv-shows',
  icon: 'tv',
  color: 'teal',
  description: 'Track your favorite TV shows',
  enabled: true,
  routes: [
    { path: '/tv-shows', name: 'TV Shows', component: ShowDetail },
    { path: '/tv-shows/show/:showId', name: 'Show Detail', component: ShowDetail },
    { path: '/tv-shows/universe/:universeId', name: 'Universe Detail', component: UniverseDetail },
  ]
};

export const financeApp: AppModule = {
  id: 'finance',
  name: 'Finance',
  slug: 'finance',
  icon: 'wallet',
  color: 'green',
  description: 'Personal finance management',
  enabled: true,
  routes: [
    { path: '/finance', name: 'Dashboard', component: FinanceDashboard, icon: 'layout-dashboard' },
    { path: '/finance/all-transactions', name: 'All Transactions', component: AllTransactions, icon: 'receipt' },
    { path: '/finance/transactions', name: 'Transactions', component: FinanceTransactions, icon: 'arrow-up-down' },
    { path: '/finance/transfers', name: 'Transfers', component: FinanceTransfers, icon: 'arrow-left-right' },
    { path: '/finance/wallets', name: 'Wallets', component: FinanceWallets, icon: 'wallet' },
    { path: '/finance/wallet/:walletId', name: 'Wallet Detail', component: WalletDetail },
    { path: '/finance/categories', name: 'Categories', component: FinanceCategories, icon: 'tag' },
    { path: '/finance/category/:categoryId', name: 'Category Detail', component: CategoryDetail },
    { path: '/finance/reports', name: 'Reports', component: FinanceReports, icon: 'bar-chart' },
    { path: '/finance/settings', name: 'Settings', component: FinanceSettings, icon: 'settings' }
  ]
};

export const apps: AppModule[] = [
  {
    id: 'home',
    name: 'Home',
    slug: 'home',
    icon: 'home',
    color: 'indigo',
    description: 'Your personal home page',
    enabled: true,
    routes: [
      { path: '/', name: 'Home', component: Landing }
    ]
  },
  tvShowsApp,
  financeApp,
];

export const getEnabledApps = (settings?: AppSettings): AppModule[] => {
  if (!settings) {
    return apps;
  }
  
  return apps.filter(app => {
    if (app.id === 'home') return true;
    if (app.id === 'tv-shows') return settings.enabledApps.tvShows;
    if (app.id === 'finance') return settings.enabledApps.finance;
    return true;
  });
};
