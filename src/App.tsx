import { Suspense, lazy } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { OrganizationProvider } from '@/contexts/OrganizationContext';
import { AppLayout } from '@/components/Layout/AppLayout';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import Landing from '@/pages/Landing';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import Login from '@/pages/Login';
import SignUpForm from '@/components/Auth/SignUpForm';
import AdminLogin from '@/pages/admin/AdminLogin';
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import Sitemap from "@/pages/Sitemap";

// Lazy load pages
const TvShowsDashboard = lazy(() => import('@/apps/tv-shows/pages/Dashboard'));
const MyShows = lazy(() => import('@/apps/tv-shows/pages/MyShows'));
const PublicShows = lazy(() => import('@/apps/tv-shows/pages/PublicShows'));
const PublicUniverses = lazy(() => import('@/apps/tv-shows/pages/PublicUniverses'));
const Universes = lazy(() => import('@/apps/tv-shows/pages/Universes'));
const PrivateUniverses = lazy(() => import('@/apps/tv-shows/pages/PrivateUniverses'));
const UniverseDetail = lazy(() => import('@/apps/tv-shows/pages/UniverseDetail'));
const UniverseDashboard = lazy(() => import('@/apps/tv-shows/pages/UniverseDashboard'));
const ShowDetail = lazy(() => import('@/apps/tv-shows/pages/ShowDetail'));

const FinanceDashboard = lazy(() => import('@/apps/finance/pages/Dashboard'));
const Wallets = lazy(() => import('@/apps/finance/pages/Wallets'));
const WalletDetail = lazy(() => import('@/apps/finance/pages/WalletDetail'));
const Transactions = lazy(() => import('@/apps/finance/pages/Transactions'));
const Categories = lazy(() => import('@/apps/finance/pages/Categories'));
const CategoryDetail = lazy(() => import('@/apps/finance/pages/CategoryDetail'));
const Transfers = lazy(() => import('@/apps/finance/pages/Transfers'));
const Reports = lazy(() => import('@/apps/finance/pages/Reports'));
const FinanceSettings = lazy(() => import('@/apps/finance/pages/Settings'));
const Budgets = lazy(() => import('@/apps/finance/pages/Budgets'));
const Credits = lazy(() => import('@/apps/finance/pages/Credits'));

// Admin pages
const AdminDashboard = lazy(() => import('@/apps/admin/pages/Dashboard'));
const AdminUsers = lazy(() => import('@/apps/admin/pages/Users'));
const AdminContent = lazy(() => import('@/apps/admin/pages/Content'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <OrganizationProvider>
          <TooltipProvider>
            <BrowserRouter>
              <div className="min-h-screen bg-gray-50">
                <Toaster />
                <Routes>
                  <Route path="/landing" element={<Landing />} />
                  <Route path="/admin/login" element={<AdminLogin />} />

                  <Route element={<AppLayout />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<SignUpForm />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/sitemap" element={<Sitemap />} />

                    <Route path="/" element={<Index />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />

                    {/* TV Shows Routes */}
                    <Route path="/tv-shows" element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <TvShowsDashboard />
                      </Suspense>
                    } />
                    <Route path="/tv-shows/my-shows" element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <MyShows />
                      </Suspense>
                    } />
                    <Route path="/tv-shows/public-shows" element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <PublicShows />
                      </Suspense>
                    } />
                    <Route path="/tv-shows/public-universes" element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <PublicUniverses />
                      </Suspense>
                    } />
                    <Route path="/tv-shows/universes" element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <Universes />
                      </Suspense>
                    } />
                    <Route path="/tv-shows/private-universes" element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <PrivateUniverses />
                      </Suspense>
                    } />
                    <Route path="/tv-shows/universe/:slug" element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <UniverseDetail />
                      </Suspense>
                    } />
                    <Route path="/tv-shows/universe/:slug/dashboard" element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <UniverseDashboard />
                      </Suspense>
                    } />
                    <Route path="/tv-shows/show/:slug" element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <ShowDetail />
                      </Suspense>
                    } />
                    
                    {/* Finance Routes */}
                    <Route path="/finance" element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <FinanceDashboard />
                      </Suspense>
                    } />
                    <Route path="/finance/wallets" element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <Wallets />
                      </Suspense>
                    } />
                    <Route path="/finance/wallet/:id" element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <WalletDetail />
                      </Suspense>
                    } />
                    <Route path="/finance/transactions" element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <Transactions />
                      </Suspense>
                    } />
                    <Route path="/finance/categories" element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <Categories />
                      </Suspense>
                    } />
                    <Route path="/finance/category/:id" element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <CategoryDetail />
                      </Suspense>
                    } />
                    <Route path="/finance/transfers" element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <Transfers />
                      </Suspense>
                    } />
                    <Route path="/finance/reports" element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <Reports />
                      </Suspense>
                    } />
                    <Route path="/finance/settings" element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <FinanceSettings />
                      </Suspense>
                    } />
                    <Route path="/finance/budgets" element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <Budgets />
                      </Suspense>
                    } />
                    <Route path="/finance/credits" element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <Credits />
                      </Suspense>
                    } />

                    {/* Admin Routes */}
                    <Route path="/admin" element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <AdminDashboard />
                      </Suspense>
                    } />
                    <Route path="/admin/users" element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <AdminUsers />
                      </Suspense>
                    } />
                    <Route path="/admin/content" element={
                      <Suspense fallback={<div>Loading...</div>}>
                        <AdminContent />
                      </Suspense>
                    } />
                  </Route>
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </OrganizationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
